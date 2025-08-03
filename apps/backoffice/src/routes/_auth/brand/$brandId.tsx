import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/brand/$brandId')({
  component: BrandDetailPage,
});

function BrandDetailPage() {
  const { brandId } = Route.useParams();

  return (
    <Container>
      <Header>
        <BackButton to="/brand">← 목록으로</BackButton>
        <TitleSection>
          <Title>브랜드 상세정보</Title>
          <Badge>ID: {brandId}</Badge>
        </TitleSection>
      </Header>

      <ContentGrid>
        <MainContent>
          <Section>
            <SectionTitle>기본 정보</SectionTitle>
            <Placeholder>브랜드 기본 정보가 여기에 표시됩니다.</Placeholder>
          </Section>

          <Section>
            <SectionTitle>사업자 정보</SectionTitle>
            <Placeholder>사업자 정보가 여기에 표시됩니다.</Placeholder>
          </Section>

          <Section>
            <SectionTitle>계좌 정보</SectionTitle>
            <Placeholder>계좌 정보가 여기에 표시됩니다.</Placeholder>
          </Section>
        </MainContent>

        <Sidebar>
          <ActionCard>
            <ActionTitle>관리 작업</ActionTitle>
            <ActionButton>정보 수정</ActionButton>
            <ActionButton variant="danger">브랜드 삭제</ActionButton>
          </ActionCard>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
}

const Container = tw.div`
  p-6
`;

const Header = tw.div`
  mb-6
`;

const BackButton = tw(Link)`
  text-gray-600 
  hover:text-gray-900 
  text-sm 
  mb-2 
  inline-block
`;

const TitleSection = tw.div`
  flex 
  items-center 
  gap-3
`;

const Title = tw.h1`
  text-2xl 
  font-bold 
  text-gray-900
`;

const Badge = tw.span`
  px-3 
  py-1 
  bg-gray-100 
  text-gray-600 
  text-sm 
  rounded-full
`;

const ContentGrid = tw.div`
  grid 
  grid-cols-1 
  lg:grid-cols-3 
  gap-6
`;

const MainContent = tw.div`
  lg:col-span-2 
  space-y-6
`;

const Section = tw.div`
  bg-white 
  rounded-lg 
  shadow-sm 
  border 
  border-gray-200 
  p-6
`;

const SectionTitle = tw.h2`
  text-lg 
  font-semibold 
  text-gray-900 
  mb-4
`;

const Placeholder = tw.p`
  text-gray-500
`;

const Sidebar = tw.div`
  lg:col-span-1
`;

const ActionCard = tw.div`
  bg-white 
  rounded-lg 
  shadow-sm 
  border 
  border-gray-200 
  p-6
`;

const ActionTitle = tw.h3`
  text-lg 
  font-semibold 
  text-gray-900 
  mb-4
`;

const ActionButton = tw.button<{ variant?: 'danger' }>`
  w-full 
  px-4 
  py-2 
  rounded-lg 
  font-medium 
  transition-colors 
  mb-3
  ${(p) =>
    p.variant === 'danger'
      ? 'bg-red-50 text-red-600 hover:bg-red-100'
      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
`;
