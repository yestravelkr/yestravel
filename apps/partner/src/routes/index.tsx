import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Building2, User } from 'lucide-react';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

/**
 * RouteComponent - 파트너 타입 선택 페이지
 *
 * 브랜드 파트너와 인플루언서 파트너 중 하나를 선택한다.
 * 인증 없이 접근 가능하다.
 */
function RouteComponent() {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo src="/logo.png" alt="YesTravel Logo" />
          <Title>YesTravel Partner</Title>
          <Subtitle>파트너 유형을 선택해 주세요</Subtitle>
        </LogoSection>

        <CardGrid>
          <PartnerCard
            onClick={() =>
              navigate({ to: '/login', search: { type: 'brand' } })
            }
          >
            <IconCircle>
              <Building2 size={32} />
            </IconCircle>
            <CardTitle>브랜드 파트너</CardTitle>
            <CardDescription>상품 관리, 주문 확인, 정산 관리</CardDescription>
            <CardButton>시작하기 &rarr;</CardButton>
          </PartnerCard>

          <PartnerCard
            onClick={() =>
              navigate({ to: '/login', search: { type: 'influencer' } })
            }
          >
            <IconCircle>
              <User size={32} />
            </IconCircle>
            <CardTitle>인플루언서 파트너</CardTitle>
            <CardDescription>캠페인 참여, 정산 확인, 실적 확인</CardDescription>
            <CardButton>시작하기 &rarr;</CardButton>
          </PartnerCard>
        </CardGrid>

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
  max-w-2xl
`;

const LogoSection = tw.div`
  text-center
  mb-10
`;

const Logo = tw.img`
  h-16
  w-auto
  mx-auto
  mb-4
`;

const Title = tw.h1`
  text-3xl
  font-bold
  text-gray-900
  mb-2
`;

const Subtitle = tw.p`
  text-gray-600
  text-lg
`;

const CardGrid = tw.div`
  flex flex-col sm:flex-row
  gap-6
`;

const PartnerCard = tw.div`
  flex-1
  bg-white
  rounded-xl
  shadow-lg
  p-8
  text-center
  cursor-pointer
  transition-all
  hover:shadow-xl
  hover:-translate-y-1
`;

const IconCircle = tw.div`
  w-16 h-16
  mx-auto
  mb-4
  rounded-full
  bg-blue-50
  flex items-center justify-center
  text-blue-600
`;

const CardTitle = tw.h2`
  text-xl
  font-semibold
  text-gray-900
  mb-2
`;

const CardDescription = tw.p`
  text-gray-500
  text-sm
  mb-6
`;

const CardButton = tw.span`
  inline-block
  text-blue-600
  font-medium
  text-sm
  hover:text-blue-700
`;

const Footer = tw.div`
  text-center
  mt-10
`;

const FooterText = tw.p`
  text-sm
  text-gray-500
`;
