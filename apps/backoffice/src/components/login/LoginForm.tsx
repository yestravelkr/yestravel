import { useForm } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import { LoadingSpinner, trpc } from '@/shared';
import { Role, useAuthStore } from '@/store';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const methods = useForm<{
    email: string;
    password: string;
  }>();

  const { login } = useAuthStore();

  const loginMutation = trpc.backofficeAuth.login.useMutation({
    onSuccess: (data) => {
      console.log('로그인 성공:', data);

      // AuthStore에 로그인 정보 저장 (localStorage 사용하지 않음)
      login(
        {
          id: 'temp-id', // 실제로는 서버에서 받아와야 함
          email: methods.getValues('email'),
          role: Role.ADMIN, // 백오피스는 기본적으로 ADMIN
        },
        data.accessToken,
      );

      onSuccess?.();
    },
    onError: (error) => {
      console.error('로그인 실패:', error);
      alert('로그인 실패');
    },
  });

  const handleSubmit = async (data: { email: string; password: string }) => {
    loginMutation.mutate(data);
  };

  return (
    <FormCard>
      <StyledForm onSubmit={methods.handleSubmit(handleSubmit)}>
        {/* 이메일 입력 */}
        <InputGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            {...methods.register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식을 입력해주세요',
              },
            })}
            placeholder="admin@yestravel.co.kr"
          />
          {methods.formState.errors.email && (
            <ErrorMessage>
              {methods.formState.errors.email.message}
            </ErrorMessage>
          )}
        </InputGroup>

        {/* 비밀번호 입력 */}
        <InputGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            {...methods.register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: {
                value: 8,
                message: '비밀번호는 최소 8자 이상이어야 합니다',
              },
            })}
            placeholder="••••••••"
          />
          {methods.formState.errors.password && (
            <ErrorMessage>
              {methods.formState.errors.password.message}
            </ErrorMessage>
          )}
        </InputGroup>

        {/* 로그인 버튼 */}
        <LoginButton type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
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

// Styled Components
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
