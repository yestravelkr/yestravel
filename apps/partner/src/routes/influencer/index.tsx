import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/influencer/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer>
      <PageTitle>인플루언서 파트너 홈</PageTitle>
      <PageDescription>
        인플루언서 파트너 대시보드입니다. 캠페인 참여, 정산 확인, 실적 확인
        기능을 이용하실 수 있습니다.
      </PageDescription>
    </PageContainer>
  );
}

// ========================================
// Styled Components
// ========================================

const PageContainer = tw.div`
  p-8
`;

const PageTitle = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

const PageDescription = tw.p`
  text-gray-600
`;
