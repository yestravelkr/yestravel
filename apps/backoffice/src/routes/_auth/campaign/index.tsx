import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/campaign/')({
  component: CampaignPage,
});

function CampaignPage() {
  return (
    <Container>
      <Header>
        <Title>캠페인 관리</Title>
        <Description>마케팅 캠페인을 관리할 수 있습니다.</Description>
      </Header>

      <Content>
        <EmptyState>
          <EmptyIcon>🎯</EmptyIcon>
          <EmptyTitle>캠페인 관리 페이지</EmptyTitle>
          <EmptyDescription>
            캠페인 관련 기능이 구현될 예정입니다.
          </EmptyDescription>
        </EmptyState>
      </Content>
    </Container>
  );
}

const Container = tw.div`
  p-6
`;

const Header = tw.div`
  mb-8
`;

const Title = tw.h1`
  text-2xl
  font-bold
  text-gray-900
  mb-2
`;

const Description = tw.p`
  text-gray-600
`;

const Content = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-8
`;

const EmptyState = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-12
  text-center
`;

const EmptyIcon = tw.div`
  text-6xl
  mb-4
`;

const EmptyTitle = tw.h2`
  text-xl
  font-semibold
  text-gray-900
  mb-2
`;

const EmptyDescription = tw.p`
  text-gray-600
`;
