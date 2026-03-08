/**
 * AddManagerModal - 관리자 추가 모달
 *
 * 파트너(브랜드/인플루언서)에 새로운 관리자를 추가하는 모달입니다.
 * react-snappy-modal + react-hook-form + zod 패턴을 사용합니다.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

import { roleOptions } from './ManagerTable';

import { ROLE_VALUES } from '@/constants/role';
import { SelectDropdown } from '@/shared/components/SelectDropdown';

const ROLE_ENUM_VALUES = [
  ROLE_VALUES.ADMIN_SUPER,
  ROLE_VALUES.ADMIN_STAFF,
  ROLE_VALUES.PARTNER_SUPER,
  ROLE_VALUES.PARTNER_STAFF,
] as const;

const addManagerSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름을 입력해주세요.'),
  phoneNumber: z.string().min(1, '연락처를 입력해주세요.'),
  role: z.enum(ROLE_ENUM_VALUES),
});

export type AddManagerInput = z.infer<typeof addManagerSchema>;

/**
 * Usage:
 * ```tsx
 * const result = await openAddManagerModal();
 * if (result) {
 *   createManager(result);
 * }
 * ```
 */
export function AddManagerModal() {
  const { resolveModal } = useCurrentModal();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddManagerInput>({
    resolver: zodResolver(addManagerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
      role: ROLE_VALUES.PARTNER_STAFF,
    },
  });

  const onSubmit = (data: AddManagerInput) => {
    resolveModal(data);
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  return (
    <Container>
      <Title>관리자 추가</Title>

      <FieldGroup>
        <FieldWrapper>
          <FieldLabel>이메일</FieldLabel>
          <StyledInput
            type="email"
            {...register('email')}
            placeholder="이메일을 입력하세요"
            $error={!!errors.email}
          />
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>비밀번호</FieldLabel>
          <StyledInput
            type="password"
            {...register('password')}
            placeholder="8자 이상 입력하세요"
            $error={!!errors.password}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>이름</FieldLabel>
          <StyledInput
            type="text"
            {...register('name')}
            placeholder="이름을 입력하세요"
            $error={!!errors.name}
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>연락처</FieldLabel>
          <StyledInput
            type="text"
            {...register('phoneNumber')}
            placeholder="010-0000-0000"
            $error={!!errors.phoneNumber}
          />
          {errors.phoneNumber && (
            <ErrorText>{errors.phoneNumber.message}</ErrorText>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>권한</FieldLabel>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <SelectDropdown
                variant="form"
                options={roleOptions}
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
        </FieldWrapper>
      </FieldGroup>

      <ButtonGroup>
        <SubmitButton type="button" onClick={handleSubmit(onSubmit)}>
          추가
        </SubmitButton>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
      </ButtonGroup>
    </Container>
  );
}

export function openAddManagerModal(): Promise<AddManagerInput | null> {
  return SnappyModal.show(<AddManagerModal />, {
    position: 'center',
  });
}

// ============================================
// Styled Components
// ============================================

const Container = tw.div`
  w-[400px]
  p-5
  bg-white
  rounded-[20px]
  flex
  flex-col
  gap-5
`;

const Title = tw.h3`
  text-[21px]
  font-bold
  leading-7
  text-[var(--fg-neutral)]
`;

const FieldGroup = tw.div`
  flex
  flex-col
  gap-4
`;

const FieldWrapper = tw.div`
  flex
  flex-col
  gap-2
`;

const FieldLabel = tw.label`
  text-[15px]
  leading-5
  text-[var(--fg-muted,#71717A)]
`;

const StyledInput = tw.input<{ $error?: boolean }>`
  w-full
  h-11
  px-4
  bg-white
  border
  rounded-xl
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
  placeholder:text-[var(--fg-placeholder,#9E9E9E)]
  outline-none
  transition-colors
  focus:ring-2 focus:ring-blue-500
  ${({ $error }) =>
    $error
      ? 'border-[var(--stroke-critical,#EB3D3D)]'
      : 'border-[var(--stroke-neutral,#E4E4E7)]'}
`;

const ErrorText = tw.p`
  text-sm
  text-[var(--fg-critical,#EB3D3D)]
`;

const ButtonGroup = tw.div`
  flex
  flex-col
  gap-2
`;

const SubmitButton = tw.button`
  h-11
  px-3
  bg-[var(--bg-primary-solid,#18181B)]
  rounded-xl
  flex
  justify-center
  items-center
  text-white
  text-[16.5px]
  font-medium
  leading-[22px]
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;

const CancelButton = tw.button`
  h-11
  px-3
  bg-[var(--bg-neutral,#f4f4f5)]
  rounded-xl
  flex
  justify-center
  items-center
  text-[var(--fg-neutral,#18181b)]
  text-[16.5px]
  font-medium
  leading-[22px]
  cursor-pointer
  hover:opacity-90
  transition-opacity
`;
