import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

// import { loginProcess } from '@/shared/apis/auth.ts';
// import { loginBeforeLoad, loginValidateSearch } from '@/shared/routes';

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

  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSubmit = async (data: { email: string; password: string }) => {
    // await loginProcess(data);
    // if (search?.redirect) {
    //   const url = new URL(search.redirect);
    //
    //   navigate({
    //     to: url.pathname,
    //     search: Object.fromEntries(url.searchParams),
    //     replace: true,
    //   });
    // } else {
    //   navigate({ to: '/', replace: true });
    // }
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
        <button>Admin 로그인</button>
      </form>
    </div>
  );
}
