import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { LoginFormData, LoginFormSchema } from './LoginFormSchema';

import { fetchAndSetProfile, LoadingSpinner, trpc } from '@/shared';
import { useAuthStore } from '@/store';

interface LoginFormProps {
  /** 파트너 유형 (BRAND | INFLUENCER) */
  partnerType: 'BRAND' | 'INFLUENCER';
  /** 로그인 성공 후 콜백 */
  onSuccess?: (partnerType: 'BRAND' | 'INFLUENCER') => void;
}

/**
 * LoginForm - 파트너 로그인 폼
 *
 * 이메일/비밀번호 입력을 통해 파트너 로그인을 처리한다.
 * partnerAuth.login API를 호출하고, 성공 시 프로필을 조회하여 authStore에 반영한다.
 *
 * Usage:
 * <LoginForm partnerType="BRAND" onSuccess={(type) => navigate({ to: `/${type.toLowerCase()}` })} />
 */
export function LoginForm({ partnerType, onSuccess }: LoginFormProps) {
  const { register, handleSubmit, formState } = useForm<LoginFormData>({
    defaultValues: { partnerType },
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuthStore();

  const loginMutation = trpc.partnerAuth.login.useMutation({
    onSuccess: (data: { accessToken: string }) => {
      login(data.accessToken);
      setIsLoading(true);

      fetchAndSetProfile()
        .then((profile) => {
          onSuccess?.(profile.partnerType as 'BRAND' | 'INFLUENCER');
        })
        .catch(() => {
          logout();
          toast.error('프로필 정보를 가져오는데 실패했습니다');
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    onError: (error) => {
      toast.error(error.message || '로그인에 실패했습니다');
    },
  });

  const isPending = loginMutation.isPending || isLoading;

  const onSubmit = (formData: LoginFormData) => {
    loginMutation.mutate(formData);
  };

  return (
    <FormCard>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            {...register('email', {
              required: '이메일을 입력해주세요',
              validate: (value) => {
                const result = LoginFormSchema.shape.email.safeParse(value);
                return (
                  result.success ||
                  result.error.issues[0]?.message ||
                  '이메일 형식이 올바르지 않습니다'
                );
              },
            })}
            placeholder="partner@yestravel.co.kr"
          />
          {formState.errors.email && (
            <ErrorMessage>{formState.errors.email.message}</ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              validate: (value) => {
                const result = LoginFormSchema.shape.password.safeParse(value);
                return (
                  result.success ||
                  result.error.issues[0]?.message ||
                  '비밀번호를 입력해주세요'
                );
              },
            })}
            placeholder="••••••••"
          />
          {formState.errors.password && (
            <ErrorMessage>{formState.errors.password.message}</ErrorMessage>
          )}
        </InputGroup>

        <LoginButton type="submit" disabled={isPending}>
          {isPending ? (
            <LoadingContainer>
              <LoadingSpinner className="-ml-1 mr-3 h-5 w-5 text-white" />
              로그인 중...
            </LoadingContainer>
          ) : (
            '로그인'
          )}
        </LoginButton>
      </StyledForm>
    </FormCard>
  );
}

// ========================================
// Styled Components
// ========================================

const FormCard = tw.div`
  bg-white
  rounded-lg
  shadow-lg
  p-8
`;

const StyledForm = tw.form`
  space-y-6
`;

const InputGroup = tw.div``;

const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
  mb-2
`;

const Input = tw.input`
  w-full
  px-3 py-2
  border border-gray-300
  rounded-md
  shadow-sm
  placeholder-gray-400
  focus:outline-none
  focus:ring-2 focus:ring-blue-500
  focus:border-blue-500
  transition-colors
`;

const ErrorMessage = tw.p`
  mt-1
  text-sm
  text-red-600
`;

const LoginButton = tw.button`
  w-full
  flex justify-center items-center
  px-4 py-2
  border border-transparent
  rounded-md
  shadow-sm
  text-sm font-medium
  text-white
  bg-blue-600
  hover:bg-blue-700
  focus:outline-none
  focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  disabled:bg-gray-400
  disabled:cursor-not-allowed
  transition-colors
`;

const LoadingContainer = tw.div`
  flex
  items-center
`;
