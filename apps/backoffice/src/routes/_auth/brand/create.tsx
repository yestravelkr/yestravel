import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

export const Route = createFileRoute('/_auth/brand/create')({
  component: BrandCreatePage,
});

function BrandCreatePage() {
  return (
    <Container>
      <Header>
        <BackButton to="/brand">← 목록으로</BackButton>
        <Title>새 브랜드 등록</Title>
      </Header>

      <FormContainer>
        <FormContent>
          <Placeholder>브랜드 등록 폼이 여기에 표시됩니다.</Placeholder>

          <ButtonGroup>
            <CancelButton to="/brand">취소</CancelButton>
            <SubmitButton type="button">등록하기</SubmitButton>
          </ButtonGroup>
        </FormContent>
      </FormContainer>
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

const Title = tw.h1`
  text-2xl 
  font-bold 
  text-gray-900
`;

const FormContainer = tw.div`
  bg-white 
  rounded-lg 
  shadow-sm 
  border 
  border-gray-200
`;

const FormContent = tw.div`
  p-6
`;

const Placeholder = tw.p`
  text-gray-500 
  text-center 
  py-12
`;

const ButtonGroup = tw.div`
  flex 
  gap-3 
  justify-end 
  mt-6 
  pt-6 
  border-t 
  border-gray-200
`;

const CancelButton = tw(Link)`
  px-4 
  py-2 
  border 
  border-gray-300 
  text-gray-700 
  rounded-lg 
  hover:bg-gray-50 
  transition-colors
  font-medium
`;

const SubmitButton = tw.button`
  px-4 
  py-2 
  bg-blue-600 
  text-white 
  rounded-lg 
  hover:bg-blue-700 
  transition-colors
  font-medium
`;
