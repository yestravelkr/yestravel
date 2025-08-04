import { createFileRoute, Outlet } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { Header, Navigation } from '@/components';
import { authBeforeLoad } from '@/shared';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: authBeforeLoad,
});

function RouteComponent() {
  return (
    <Container>
      <Header />
      <ContentWrapper>
        <Navigation />
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentWrapper>
    </Container>
  );
}

const Container = tw.div`
  flex 
  flex-col 
  h-screen 
  bg-gray-50
`;

const ContentWrapper = tw.div`
  flex 
  flex-1 
  overflow-hidden
`;

const MainContent = tw.main`
  flex-1 
  overflow-auto 
  bg-white
`;
