import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/brand/')({
  component: BrandListPage,
});

function BrandListPage() {
  return (
    <Container>
      <Header>
        <Title>브랜드 관리</Title>
        <CreateButton to="/brand/create">새 브랜드 등록</CreateButton>
      </Header>

      <Content>
        <Description>등록된 브랜드 목록이 여기에 표시됩니다.</Description>
      </Content>
    </Container>
  );
}

const Container = tw.div`
  p-6
`;

const Header = tw.div`
  flex 
  justify-between 
  items-center 
  mb-6
`;

const Title = tw.h1`
  text-2xl 
  font-bold 
  text-gray-900
`;

const CreateButton = tw(Link)`
  px-4 
  py-2 
  bg-blue-600 
  text-white 
  rounded-lg 
  hover:bg-blue-700 
  transition-colors
  font-medium
`;

const Content = tw.div`
  bg-white 
  rounded-lg 
  shadow-sm 
  border 
  border-gray-200 
  p-8
`;

const Description = tw.p`
  text-gray-500 
  text-center
`;
