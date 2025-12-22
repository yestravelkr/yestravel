import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/$slug/sale/$saleId')({
  component: SalePage,
});

function SalePage() {
  const { slug, saleId } = Route.useParams();

  return (
    <PageContainer>
      <Content>
        <Title>상품 판매 페이지</Title>
        <Info>인플루언서 Slug: {slug}</Info>
        <Info>Sale ID: {saleId}</Info>
        <Info>TODO: 상품 상세 API 연동 필요</Info>
      </Content>
    </PageContainer>
  );
}

const PageContainer = tw.div`
  max-w-4xl
  mx-auto
  px-4
  py-8
`;

const Content = tw.div`
  text-center
  p-8
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-4
`;

const Info = tw.p`
  text-gray-600
  mb-2
`;
