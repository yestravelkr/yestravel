import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/i/$slug/c/$campaignId')({
  component: CampaignDetailPage,
});

/**
 * 캠페인 상세 페이지
 * 부모 레이아웃(i.$slug.tsx)에서 HeaderLayout 헤더를 상속받음
 */
function CampaignDetailPage() {
  const { slug, campaignId } = Route.useParams();

  return (
    <ContentContainer>
      <Content>
        <Title>캠페인 상세 페이지</Title>
        <Info>인플루언서 Slug: {slug}</Info>
        <Info>캠페인 ID: {campaignId}</Info>
        <Info>TODO: 캠페인 상세 API 연동 필요</Info>
      </Content>
    </ContentContainer>
  );
}

// Styled Components
const ContentContainer = tw.div`
  px-5
  py-6
`;

const Content = tw.div`
  text-center
  p-8
  bg-white
  rounded-xl
  border
  border-[var(--stroke-neutral)]
`;

const Title = tw.h1`
  text-xl
  font-bold
  text-fg-neutral
  mb-4
`;

const Info = tw.p`
  text-fg-muted
  mb-2
  text-sm
`;
