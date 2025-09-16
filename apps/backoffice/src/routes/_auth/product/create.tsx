import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';

export const Route = createFileRoute('/_auth/product/create')({
  component: CreateProductPage,
});

function CreateProductPage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate({ to: '/product' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 품목 생성 API 연결
    console.log('품목 생성 처리');
  };

  return (
    <MajorPageLayout
      title="새 품목 등록"
      description="새로운 품목을 등록하여 관리를 시작하세요."
      headerActions={<CancelButton to="/product">취소</CancelButton>}
    >
      <FormContainer>
        <FormCard>
          <FormTitle>품목 정보</FormTitle>
          <Form onSubmit={handleSubmit}>
            {/* TODO: 품목 입력 필드들 추가 */}

            <FormActions>
              <SecondaryButton type="button" onClick={handleCancel}>
                취소
              </SecondaryButton>
              <PrimaryButton type="submit">품목 등록</PrimaryButton>
            </FormActions>
          </Form>
        </FormCard>
      </FormContainer>
    </MajorPageLayout>
  );
}

// 폼 컨테이너
const FormContainer = tw.div`
  max-w-2xl
  mx-auto
`;

// 폼 카드
const FormCard = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-6
`;

// 폼 제목
const FormTitle = tw.h2`
  text-lg
  font-semibold
  text-gray-900
  mb-6
`;

// 폼
const Form = tw.form`
  space-y-6
`;

// 폼 섹션
const FormSection = tw.div`
  space-y-4
`;

// 폼 행 (가로 배치)
const FormRow = tw.div`
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
`;

// 폼 필드
const FormField = tw.div`
  space-y-2
`;

// 라벨
const Label = tw.label`
  block
  text-sm
  font-medium
  text-gray-700
`;

// 인풋
const Input = tw.input`
  block
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  shadow-sm
  placeholder-gray-400
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
  sm:text-sm
`;

// 셀렉트
const Select = tw.select`
  block
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  shadow-sm
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
  sm:text-sm
`;

// 텍스트에어리어
const Textarea = tw.textarea`
  block
  w-full
  px-3
  py-2
  border
  border-gray-300
  rounded-md
  shadow-sm
  placeholder-gray-400
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:border-blue-500
  sm:text-sm
  resize-vertical
`;

// 체크박스 컨테이너
const CheckboxContainer = tw.div`
  flex
  items-center
  space-x-2
`;

// 체크박스
const Checkbox = tw.input`
  h-4
  w-4
  text-blue-600
  focus:ring-blue-500
  border-gray-300
  rounded
`;

// 체크박스 라벨
const CheckboxLabel = tw.label`
  text-sm
  text-gray-700
  cursor-pointer
`;

// 폼 액션
const FormActions = tw.div`
  flex
  justify-end
  space-x-3
  pt-6
  border-t
  border-gray-200
`;

// 취소 버튼
const CancelButton = tw(Link)`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

// 보조 버튼
const SecondaryButton = tw.button`
  px-4
  py-2
  text-gray-700
  bg-white
  border
  border-gray-300
  rounded-lg
  hover:bg-gray-50
  transition-colors
  font-medium
`;

// 주 버튼
const PrimaryButton = tw.button`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
`;
