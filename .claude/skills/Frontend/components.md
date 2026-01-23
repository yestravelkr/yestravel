---
name: Frontend-components
description: 프론트엔드 컴포넌트 패턴. Modal(react-snappy-modal), Toast(sonner), Icon(lucide-react), 상태관리(Zustand).
keywords: [컴포넌트, Modal, Toast, Icon, lucide, sonner, Zustand, Suspense, EmptyState]
estimated_tokens: ~600
---

# 컴포넌트 패턴

## Modal 패턴 (react-snappy-modal)

### 기본 구조

```typescript
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';

function MyModal({ data }: { data: string }) {
  const { resolveModal } = useCurrentModal();

  const handleConfirm = () => resolveModal({ success: true, data });
  const handleCancel = () => resolveModal(null);

  return (
    <ModalContainer>
      <ModalContent>{data}</ModalContent>
      <ButtonGroup>
        <CancelButton onClick={handleCancel}>취소</CancelButton>
        <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
      </ButtonGroup>
    </ModalContainer>
  );
}

// open 함수를 같은 파일에서 export
export function openMyModal(data: string) {
  return SnappyModal.show(<MyModal data={data} />);
}
```

### 사용

```typescript
import { openMyModal } from './MyModal';

const handleClick = async () => {
  const result = await openMyModal('데이터');
  if (result?.success) {
    // 확인 처리
  }
};
```

**핵심 규칙**:
- `SnappyModal.close()` 금지 → `resolveModal()` 사용
- Modal 컴포넌트와 open 함수를 같은 파일에 정의

## Toast 알림 (sonner)

```typescript
import { toast } from 'sonner';

// ✅ sonner 사용
toast.success('저장되었습니다.');
toast.error('오류가 발생했습니다.');
toast.info('정보 메시지');

// ❌ alert() 금지
alert('메시지');
```

## Suspense + Skeleton

```typescript
import { Suspense } from 'react';

function PageComponent() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}

function PageContent() {
  // useSuspenseQuery로 데이터 로딩
  const [data] = trpc.module.getData.useSuspenseQuery();
  return <div>{data.name}</div>;
}

function PageSkeleton() {
  return (
    <Container>
      <SkeletonBox style={{ width: '100%', height: '200px' }} />
    </Container>
  );
}
```

## 레이아웃 패턴

### MajorPageLayout (backoffice)

```typescript
import { MajorPageLayout } from '@/components/layout';

function AdminPage() {
  return (
    <MajorPageLayout
      title="페이지 제목"
      description="페이지 설명"
      actions={<CreateButton />}
    >
      <PageContent />
    </MajorPageLayout>
  );
}
```

### 모바일 레이아웃 (shop)

```typescript
const Container = tw.div`
  min-h-screen
  bg-bg-layer-base
  max-w-[600px]
  mx-auto
`;

const Header = tw.header`
  h-16
  px-5
  py-5
  bg-white
  flex
  items-center
  gap-5
`;
```

## 폼 컴포넌트

### FormProvider 패턴

```typescript
// 부모 컴포넌트
import { FormProvider, useForm } from 'react-hook-form';

function FormPage() {
  const methods = useForm<FormData>({
    defaultValues: { name: '', email: '' },
  });

  return (
    <FormProvider {...methods}>
      <FormSection />
      <SubmitSection />
    </FormProvider>
  );
}

// 자식 컴포넌트
function FormSection() {
  const { register, watch, setValue } = useFormContext<FormData>();

  return (
    <Section>
      <Input {...register('name')} placeholder="이름" />
      <Input {...register('email')} placeholder="이메일" />
    </Section>
  );
}
```

## 아이콘 컴포넌트

```typescript
import { Home, ChevronRight, X, ArrowLeft } from 'lucide-react';

// 크기 일관성
<Home size={24} />
<ChevronRight size={20} />

// 색상 적용
<X size={24} className="text-fg-neutral" />
```

## 컴포넌트 파일 구조

```
routes/
├── page.tsx              # 라우트 컴포넌트
└── _components/          # 페이지 전용 컴포넌트
    ├── index.ts          # export 정리
    ├── Section.tsx
    └── Card.tsx

components/
├── common/               # 공통 컴포넌트
├── layout/               # 레이아웃 컴포넌트
└── feature/              # 기능별 컴포넌트
    └── index.ts          # export 정리
```

## 참고 파일

- Modal 예시: `apps/backoffice/src/components/modal/`
- Layout 예시: `apps/backoffice/src/components/layout/`
- Form 예시: `apps/shop/src/components/new-order/`
