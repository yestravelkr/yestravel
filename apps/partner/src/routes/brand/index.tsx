import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/brand/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageContainer>
      <PageTitle>브랜드 파트너 홈</PageTitle>
      <PageDescription>
        브랜드 파트너 대시보드입니다. 상품 관리, 주문 확인, 정산 관리 기능을
        이용하실 수 있습니다.
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
