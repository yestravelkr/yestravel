import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

import { Header, Navigation } from '@/components';
import { authBeforeLoad } from '@/shared';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: authBeforeLoad,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Body>
        <Navigation />
        <main className="flex-1 p-6 overflow-auto bg-gray-100">
          <Outlet />
        </main>
      </Body>
    </div>
  );
}

const Body = (props: PropsWithChildren) => (
  <div className={'flex flex-1 overflow-hidden'}>{props.children}</div>
);
