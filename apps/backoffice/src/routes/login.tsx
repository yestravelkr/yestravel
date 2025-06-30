import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { trpc } from '@/shared';
import { Role, useAuthStore } from '@/store';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  // validateSearch: loginValidateSearch,
  // beforeLoad: loginBeforeLoad,
});

function RouteComponent() {
  const methods = useForm<{
    email: string;
    password: string;
  }>();

  const navigate = Route.useNavigate();
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

      navigate({ to: '/', replace: true });
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
    <div>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <label htmlFor="email">
          에미일:
          <input type="text" id={'email'} {...methods.register('email')} />
        </label>
        <br />
        <label htmlFor="password">
          비번:
          <input
            type="password"
            id={'password'}
            {...methods.register('password')}
          />
        </label>
        <br />
        <button disabled={loginMutation.isPending}>
          {loginMutation.isPending ? '로그인 중...' : 'Admin 로그인'}
        </button>
      </form>
    </div>
  );
}
