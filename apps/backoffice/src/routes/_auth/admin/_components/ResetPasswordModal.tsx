/**
 * ResetPasswordModal - 관리자 비밀번호 재설정 모달
 *
 * react-snappy-modal + react-hook-form + zod 패턴을 사용합니다.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@yestravelkr/min-design-system';
import { useForm } from 'react-hook-form';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';
import { z } from 'zod';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  adminName: string;
}

/**
 * Usage:
 * ```tsx
 * const newPassword = await openResetPasswordModal({ adminName: '홍길동' });
 * if (newPassword) {
 *   updatePassword({ id: adminId, newPassword });
 * }
 * ```
 */
function ResetPasswordModal({ adminName }: ResetPasswordModalProps) {
  const { resolveModal } = useCurrentModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resolveModal(data.newPassword);
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  return (
    <Container>
      <Title>{adminName}님 비밀번호 재설정</Title>

      <FieldGroup>
        <FieldWrapper>
          <FieldLabel>새 비밀번호</FieldLabel>
          <StyledInput
            type="password"
            {...register('newPassword')}
            placeholder="최소 6자 이상"
            $error={!!errors.newPassword}
          />
          {errors.newPassword && (
            <ErrorText>{errors.newPassword.message}</ErrorText>
          )}
        </FieldWrapper>

        <FieldWrapper>
          <FieldLabel>비밀번호 확인</FieldLabel>
          <StyledInput
            type="password"
            {...register('confirmPassword')}
            placeholder="비밀번호를 다시 입력하세요"
            $error={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <ErrorText>{errors.confirmPassword.message}</ErrorText>
          )}
        </FieldWrapper>
      </FieldGroup>

      <ButtonGroup>
        <Button
          kind="neutral"
          variant="solid"
          size="large"
          onClick={handleSubmit(onSubmit)}
        >
          변경
        </Button>
        <CancelButton type="button" onClick={handleCancel}>
          취소
        </CancelButton>
      </ButtonGroup>
    </Container>
  );
}

export function openResetPasswordModal(
  props: ResetPasswordModalProps,
): Promise<string | null> {
  return SnappyModal.show(<ResetPasswordModal {...props} />, {
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
