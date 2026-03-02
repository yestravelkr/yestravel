import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { LoginForm } from '@/components/login';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/', replace: true });
  };

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo src="/logo.png" alt="YesTravel Logo" />
          <Title>파트너 로그인</Title>
          <Subtitle>파트너 계정으로 로그인하세요</Subtitle>
        </LogoSection>

        <LoginForm onSuccess={handleLoginSuccess} />

        <Footer>
          <FooterText>&copy; 2024 YesTravel. All rights reserved.</FooterText>
        </Footer>
      </ContentWrapper>
    </Container>
  );
}

// ========================================
// Styled Components
// ========================================

const Container = tw.div`
  min-h-screen
  bg-gradient-to-br from-blue-50 to-indigo-100
  flex items-center justify-center
  p-4
`;

const ContentWrapper = tw.div`
  w-full
  max-w-md
`;

const LogoSection = tw.div`
  text-center
  mb-8
`;

const Logo = tw.img`
  h-16
  w-auto
  mx-auto
  mb-4
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

const Subtitle = tw.p`
  text-gray-600
`;

const Footer = tw.div`
  text-center
  mt-8
`;

const FooterText = tw.p`
  text-sm
  text-gray-500
`;
