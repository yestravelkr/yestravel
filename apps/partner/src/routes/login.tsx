import { Link, createFileRoute } from '@tanstack/react-router';
import { Building2, User } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { LoginForm } from '@/components/login';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    type: search.type as 'brand' | 'influencer' | undefined,
  }),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { type } = Route.useSearch();

  const handleLoginSuccess = () => {
    navigate({ to: '/', replace: true });
  };

  const titleText =
    type === 'brand'
      ? '브랜드 파트너 로그인'
      : type === 'influencer'
        ? '인플루언서 파트너 로그인'
        : '파트너 로그인';

  const TypeIcon =
    type === 'brand' ? Building2 : type === 'influencer' ? User : null;

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo src="/logo.png" alt="YesTravel Logo" />
          {TypeIcon && (
            <TypeIconWrapper>
              <TypeIcon size={24} />
            </TypeIconWrapper>
          )}
          <Title>{titleText}</Title>
          <Subtitle>파트너 계정으로 로그인하세요</Subtitle>
        </LogoSection>

        <LoginForm onSuccess={handleLoginSuccess} />

        <BackLinkWrapper>
          <BackLink to="/">&larr; 파트너 유형 선택으로 돌아가기</BackLink>
        </BackLinkWrapper>

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

const TypeIconWrapper = tw.div`
  w-12 h-12
  mx-auto
  mb-3
  rounded-full
  bg-blue-50
  flex items-center justify-center
  text-blue-600
`;

const BackLinkWrapper = tw.div`
  text-center
  mt-6
`;

const BackLink = tw(Link)`
  text-sm
  text-gray-500
  hover:text-gray-700
  transition-colors
`;

const Footer = tw.div`
  text-center
  mt-8
`;

const FooterText = tw.p`
  text-sm
  text-gray-500
`;
