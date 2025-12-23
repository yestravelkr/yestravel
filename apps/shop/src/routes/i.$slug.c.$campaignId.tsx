import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/i/$slug/c/$campaignId')({
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { slug, campaignId } = Route.useParams();

  return (
    <PageContainer>
      <Content>
        <Title>캠페인 상세 페이지</Title>
        <Info>인플루언서 Slug: {slug}</Info>
        <Info>캠페인 ID: {campaignId}</Info>
        <Info>TODO: 캠페인 상세 API 연동 필요</Info>
      </Content>
    </PageContainer>
  );
}

const PageContainer = tw.div`
  px-5
  py-6
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
