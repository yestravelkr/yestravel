import { createFileRoute, Link } from '@tanstack/react-router';

// import { unauthorizedValidateSearch } from '@/shared/routes';

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
  // validateSearch: unauthorizedValidateSearch,
});

function RouteComponent() {
  // const { redirect } = Route.useSearch();
  return (
    <div>
      {/*{redirect} 페이지에 권한이 없습니다.*/}
      <br />
      <Link to={'/'}>메인 페이지로</Link>
    </div>
  );
}
