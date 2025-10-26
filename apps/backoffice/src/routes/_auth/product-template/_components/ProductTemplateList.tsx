import { useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';

// ProductTemplate 타입 정의 (API 응답 기반)
interface ProductTemplate {
  id: number;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name: string;
  brand: {
    id: number;
    name: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
  isIntegrated: boolean;
  useStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function ProductTemplateList() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 품목 템플릿 리스트 조회 (페이지네이션 포함)
  const [data] = trpc.backofficeProductTemplate.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });
  const productTemplates = data?.data || [];

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(productTemplates.map((item: ProductTemplate) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택/해제
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // 삭제 처리
  const handleDelete = (id: number, name: string) => {
    if (confirm(`"${name}" 품목을 삭제하시겠습니까?`)) {
      // TODO: 삭제 API 연동
      console.log('Delete:', id);
    }
  };

  const columns = [
    {
      key: 'checkbox',
      header: (
        <Checkbox
          type="checkbox"
          checked={
            productTemplates.length > 0 &&
            selectedIds.length === productTemplates.length
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSelectAll(e.target.checked)
          }
        />
      ),
      render: (productTemplate: ProductTemplate) => (
        <Checkbox
          type="checkbox"
          checked={selectedIds.includes(productTemplate.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSelectOne(productTemplate.id, e.target.checked)
          }
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ),
      width: '5%',
    },
    {
      key: 'name',
      header: '품목',
      render: (productTemplate: ProductTemplate) => (
        <div>
          <ProductTemplateName>{productTemplate.name}</ProductTemplateName>
          <TypeBadge type={productTemplate.type}>
            {getTypeLabel(productTemplate.type)}
          </TypeBadge>
        </div>
      ),
      width: '25%',
    },
    {
      key: 'brand',
      header: '브랜드',
      render: (productTemplate: ProductTemplate) => (
        <BrandName>{productTemplate.brand.name}</BrandName>
      ),
      width: '15%',
    },
    {
      key: 'categories',
      header: '카테고리',
      render: (productTemplate: ProductTemplate) => (
        <CategoryList>
          {productTemplate.categories.length > 0
            ? productTemplate.categories.map((cat) => cat.name).join(', ')
            : '-'}
        </CategoryList>
      ),
      width: '15%',
    },
    {
      key: 'isIntegrated',
      header: '연동상태',
      render: (productTemplate: ProductTemplate) => (
        <StatusBadge isActive={productTemplate.isIntegrated}>
          {productTemplate.isIntegrated ? '연동' : '미연동'}
        </StatusBadge>
      ),
      width: '8%',
    },
    {
      key: 'useStock',
      header: '재고관리',
      render: (productTemplate: ProductTemplate) => (
        <StatusValue>{productTemplate.useStock ? 'Y' : 'N'}</StatusValue>
      ),
      width: '8%',
    },
    {
      key: 'createdAt',
      header: '등록일',
      render: (productTemplate: ProductTemplate) => (
        <DateText>
          {new Date(productTemplate.createdAt).toLocaleDateString('ko-KR')}
        </DateText>
      ),
      width: '10%',
    },
    {
      key: 'updatedAt',
      header: '수정일',
      render: (productTemplate: ProductTemplate) => (
        <DateText>
          {new Date(productTemplate.updatedAt).toLocaleDateString('ko-KR')}
        </DateText>
      ),
      width: '10%',
    },
    {
      key: 'actions',
      header: '부가기능',
      render: (productTemplate: ProductTemplate) => (
        <ActionsContainer
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <EditButton
            to={`/product-template/${productTemplate.id}/edit`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            수정
          </EditButton>
          <DeleteButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDelete(productTemplate.id, productTemplate.name);
            }}
          >
            삭제
          </DeleteButton>
        </ActionsContainer>
      ),
      width: '14%',
    },
  ];

  const handleRowClick = (productTemplate: ProductTemplate) => {
    navigate({ to: `/product-template/${productTemplate.id}` });
  };

  if (productTemplates && productTemplates.length > 0) {
    return (
      <Table
        columns={columns}
        data={productTemplates}
        onRowClick={handleRowClick}
      />
    );
  }

  return (
    <EmptyState
      icon={<InboxIcon />}
      title="등록된 품목이 없습니다"
      description="새로운 품목을 등록하여 관리를 시작하세요."
      action={
        <CreateButton to="/product-template/create">
          첫 품목 등록하기
        </CreateButton>
      }
    />
  );
}

// 타입 라벨 변환 함수
function getTypeLabel(type: 'HOTEL' | 'E-TICKET' | 'DELIVERY'): string {
  const labels = {
    HOTEL: '숙박',
    'E-TICKET': '티켓',
    DELIVERY: '배송',
  };
  return labels[type] || type;
}

// 체크박스
const Checkbox = tw.input`
  w-4
  h-4
  text-blue-600
  border-gray-300
  rounded
  focus:ring-blue-500
  cursor-pointer
`;

// 타입별 색상 뱃지 (작게)
const TypeBadge = tw.span<{ type: string }>`
  inline-flex
  items-center
  px-2
  py-0.5
  rounded
  text-xs
  font-medium
  ml-2
  ${(props) => {
    switch (props.type) {
      case 'HOTEL':
        return 'bg-blue-100 text-blue-800';
      case 'E-TICKET':
        return 'bg-green-100 text-green-800';
      case 'DELIVERY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }}
`;

// 품목명 표시 - 굵은 글씨로 강조
const ProductTemplateName = tw.div`
  font-medium
  text-gray-900
  inline
`;

// 브랜드명 표시
const BrandName = tw.div`
  text-sm
  text-gray-900
`;

// 카테고리 리스트
const CategoryList = tw.div`
  text-sm
  text-gray-600
`;

// 상태 뱃지 (연동/미연동)
const StatusBadge = tw.span<{ isActive: boolean }>`
  inline-flex
  items-center
  px-2
  py-0.5
  rounded
  text-xs
  font-medium
  ${(props) =>
    props.isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-600'}
`;

// Y/N 상태 표시
const StatusValue = tw.div`
  text-sm
  font-medium
  text-gray-900
`;

// 날짜 텍스트
const DateText = tw.div`
  text-sm
  text-gray-500
`;

// 액션 버튼 컨테이너
const ActionsContainer = tw.div`
  flex
  gap-2
`;

// 수정 버튼
const EditButton = tw(Link)`
  px-3
  py-1
  text-sm
  text-blue-600
  border
  border-blue-600
  rounded
  hover:bg-blue-50
  transition-colors
`;

// 삭제 버튼
const DeleteButton = tw.button`
  px-3
  py-1
  text-sm
  text-red-600
  border
  border-red-600
  rounded
  hover:bg-red-50
  transition-colors
`;

// 새 품목 등록 버튼
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
