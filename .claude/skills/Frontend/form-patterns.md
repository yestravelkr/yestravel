---
name: Frontend-form-patterns
description: React Hook Form 패턴 가이드. FormProvider, useFormContext, Controller, zodResolver 검증.
keywords: [폼, ReactHookForm, FormProvider, useFormContext, Controller, zodResolver, 유효성검사]
estimated_tokens: ~500
---

# React Hook Form 패턴

## FormProvider + useFormContext

### 부모 컴포넌트

```typescript
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 폼 스키마 정의
const formSchema = z.object({
  userName: z.string().min(1, '이름을 입력해주세요'),
  userPhone: z.string().min(1, '전화번호를 입력해주세요'),
  paymentMethod: z.enum(['kakaopay', 'naverpay', 'card']),
});

// 타입 export (자식 컴포넌트에서 사용)
export type FormData = z.infer<typeof formSchema>;

function FormPage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: '',
      userPhone: '',
      paymentMethod: 'kakaopay',
    },
  });

  const handleSubmit = methods.handleSubmit((data) => {
    console.log(data);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <UserSection />
        <PaymentSection />
        <SubmitButton />
      </form>
    </FormProvider>
  );
}
```

### 자식 컴포넌트

```typescript
import { useFormContext } from 'react-hook-form';
import type { FormData } from '../FormPage';

function UserSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<FormData>();

  const userName = watch('userName');

  return (
    <Section>
      <Input
        {...register('userName')}
        placeholder="이름을 입력해주세요"
      />
      {errors.userName && <ErrorText>{errors.userName.message}</ErrorText>}

      <Input
        {...register('userPhone')}
        placeholder="전화번호"
        inputMode="numeric"
      />
    </Section>
  );
}
```

## 커스텀 컴포넌트 연동

### Checkbox 연동

```typescript
function CheckboxSection() {
  const { watch, setValue } = useFormContext<FormData>();
  const agreed = watch('agreed');

  return (
    <Checkbox
      checked={agreed}
      onChange={(checked) => setValue('agreed', checked)}
      label="동의합니다"
    />
  );
}
```

### Radio 그룹 연동

```typescript
function PaymentMethodSection() {
  const { watch, setValue } = useFormContext<FormData>();
  const paymentMethod = watch('paymentMethod');

  const methods = [
    { value: 'kakaopay', label: '카카오페이' },
    { value: 'naverpay', label: '네이버페이' },
    { value: 'card', label: '신용카드' },
  ];

  return (
    <MethodList>
      {methods.map(method => (
        <MethodItem
          key={method.value}
          onClick={() => setValue('paymentMethod', method.value)}
        >
          <RadioIcon $selected={paymentMethod === method.value}>
            {paymentMethod === method.value ? <CircleDot size={20} /> : <Circle size={20} />}
          </RadioIcon>
          <Label>{method.label}</Label>
        </MethodItem>
      ))}
    </MethodList>
  );
}
```

## 폼 유효성 검사

```typescript
function SubmitSection() {
  const { watch, formState: { isValid, isSubmitting } } = useFormContext<FormData>();

  // 추가 조건 체크
  const userName = watch('userName');
  const userPhone = watch('userPhone');
  const isFormValid = userName.trim().length > 0 && userPhone.trim().length > 0;

  return (
    <SubmitButton
      type="submit"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? '처리 중...' : '제출하기'}
    </SubmitButton>
  );
}
```

## tRPC Mutation 연동

```typescript
function SubmitSection() {
  const methods = useFormContext<FormData>();
  const createMutation = trpc.module.create.useMutation({
    onSuccess: () => {
      toast.success('저장되었습니다');
      methods.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = methods.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  return (
    <SubmitButton
      onClick={handleSubmit}
      disabled={createMutation.isPending}
    >
      저장
    </SubmitButton>
  );
}
```

## 참고 파일

- 예시: `apps/shop/src/routes/new-order.$orderNumber.tsx`
- UserInputSection: `apps/shop/src/components/new-order/UserInputSection.tsx`
- PaymentMethodSection: `apps/shop/src/components/new-order/PaymentMethodSection.tsx`
