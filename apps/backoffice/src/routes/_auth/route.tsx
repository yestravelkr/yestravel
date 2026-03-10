import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import tw from 'tailwind-styled-components';

import { Navigation } from '@/components';
import { authBeforeLoad } from '@/shared';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: authBeforeLoad,
});

function RouteComponent() {
  return (
    <Container>
      <Navigation />
      <MainContent>
        <Outlet />
      </MainContent>
      <Toaster position="top-right" />
    </Container>
  );
}

const Container = tw.div`
  flex
  h-screen
  overflow-hidden
`;

const MainContent = tw.main`
  flex-1
  bg-zinc-100
  overflow-auto
`;
