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
        <Form onSubmit={handleSubmit}>
          <FormColumns>
            <LeftColumn>
              <FormCard>
                <FormTitle>기본 정보</FormTitle>
                <FormDescription>
                  채널 노출에 필요한 기본 속성을 입력하세요.
                </FormDescription>
                <FormSection>
                  <FormRow>
                    <FormField>
                      <Label htmlFor="product-name">노출명</Label>
                      <Input
                        id="product-name"
                        name="productName"
                        placeholder="예) 제주 2박 3일 패키지"
                      />
                    </FormField>
                    <FormField>
                      <Label htmlFor="internal-name">내부 관리명</Label>
                      <Input
                        id="internal-name"
                        name="internalName"
                        placeholder="예) jeju-pkg-2n3d"
                      />
                    </FormField>
                  </FormRow>
                  <FormRow>
                    <FormField>
                      <Label htmlFor="product-status">판매 상태</Label>
                      <Select
                        id="product-status"
                        name="productStatus"
                        defaultValue="draft"
                      >
                        <option value="draft">준비중</option>
                        <option value="active">판매중</option>
                        <option value="inactive">일시중지</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label htmlFor="sales-start-at">판매 시작일</Label>
                      <Input
                        id="sales-start-at"
                        name="salesStartAt"
                        type="date"
                      />
                    </FormField>
                  </FormRow>
                </FormSection>
              </FormCard>

              <FormCard>
                <FormTitle>상품 구분</FormTitle>
                <FormDescription>
                  판매 채널과 진행 방식을 설정하세요.
                </FormDescription>
                <FormSection>
                  <FormRow>
                    <FormField>
                      <Label htmlFor="product-type">상품 유형</Label>
                      <Select
                        id="product-type"
                        name="productType"
                        defaultValue="package"
                      >
                        <option value="package">패키지 여행</option>
                        <option value="ticket">티켓/입장권</option>
                        <option value="accommodation">숙박</option>
                        <option value="etc">기타</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label htmlFor="sales-channel">판매 채널</Label>
                      <Select
                        id="sales-channel"
                        name="salesChannel"
                        defaultValue="online"
                      >
                        <option value="online">온라인</option>
                        <option value="offline">오프라인</option>
                        <option value="mixed">온/오프라인 병행</option>
                      </Select>
                    </FormField>
                  </FormRow>
                  <CheckboxGroup>
                    <CheckboxContainer>
                      <Checkbox
                        id="travel-seasonal"
                        name="isSeasonal"
                        type="checkbox"
                      />
                      <CheckboxLabel htmlFor="travel-seasonal">
                        시즌 한정 상품
                      </CheckboxLabel>
                    </CheckboxContainer>
                    <CheckboxContainer>
                      <Checkbox
                        id="travel-bundle"
                        name="isBundle"
                        type="checkbox"
                      />
                      <CheckboxLabel htmlFor="travel-bundle">
                        묶음 구성 포함
                      </CheckboxLabel>
                    </CheckboxContainer>
                  </CheckboxGroup>
                </FormSection>
              </FormCard>

              <FormCard>
                <FormTitle>상세 정보</FormTitle>
                <FormDescription>
                  가격, 재고 등 운영에 필요한 정보를 입력하세요.
                </FormDescription>
                <FormSection>
                  <FormRow>
                    <FormField>
                      <Label htmlFor="brand">브랜드</Label>
                      <Select id="brand" name="brand">
                        <option value="">선택하세요</option>
                        <option value="brand-a">예시 브랜드 A</option>
                        <option value="brand-b">예시 브랜드 B</option>
                      </Select>
                    </FormField>
                    <FormField>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        name="sku"
                        placeholder="예) YT-TRAVEL-0001"
                      />
                    </FormField>
                  </FormRow>
                  <FormRow>
                    <FormField>
                      <Label htmlFor="price">판매가</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        placeholder="예) 399000"
                      />
                    </FormField>
                    <FormField>
                      <Label htmlFor="inventory">잔여 재고</Label>
                      <Input
                        id="inventory"
                        name="inventory"
                        type="number"
                        min={0}
                        placeholder="예) 50"
                      />
                    </FormField>
                  </FormRow>
                </FormSection>
              </FormCard>
            </LeftColumn>

            <RightColumn>
              <FormCard>
                <FormTitle>상세 페이지</FormTitle>
                <FormDescription>
                  고객에게 노출될 핵심 소개 문구와 상세 설명을 작성하세요.
                </FormDescription>
                <FormSection>
                  <FormField>
                    <Label htmlFor="summary">한 줄 소개</Label>
                    <Input
                      id="summary"
                      name="summary"
                      placeholder="예) 제주에서 즐기는 힐링 여행"
                    />
                  </FormField>
                  <FormField>
                    <Label htmlFor="description">상세 설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={6}
                      placeholder="일정, 포함 사항, 유의사항 등을 자세히 입력하세요."
                    />
                  </FormField>
                </FormSection>
              </FormCard>
            </RightColumn>
          </FormColumns>

          <FormActions>
            <SecondaryButton type="button" onClick={handleCancel}>
              취소
            </SecondaryButton>
            <PrimaryButton type="submit">품목 등록</PrimaryButton>
          </FormActions>
        </Form>
      </FormContainer>
    </MajorPageLayout>
  );
}

// 폼 컨테이너
const FormContainer = tw.div`
  w-full
  max-w-6xl
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
`;

// 폼 설명
const FormDescription = tw.p`
  mt-2
  text-sm
  text-gray-600
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

// 폼 컬럼
const FormColumns = tw.div`
  grid
  grid-cols-1
  gap-6
  lg:grid-cols-5
`;

// 왼쪽 컬럼
const LeftColumn = tw.div`
  space-y-6
  lg:col-span-3
`;

// 오른쪽 컬럼
const RightColumn = tw.div`
  space-y-6
  lg:col-span-2
`;

// 폼 행 (가로 배치)
const FormRow = tw.div`
  grid
  grid-cols-1
  gap-4
  sm:grid-cols-2
`;

// 체크박스 그룹
const CheckboxGroup = tw.div`
  flex
  flex-col
  gap-3
  sm:flex-row
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
