import { useNavigate, Link } from '@tanstack/react-router';
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

  // 품목 템플릿 리스트 조회 (페이지네이션 포함)
  const [data] = trpc.backofficeProductTemplate.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });
  const productTemplates = data?.data || [];

  const columns = [
    {
      key: 'type',
      header: '타입',
      render: (productTemplate: ProductTemplate) => (
        <TypeBadge type={productTemplate.type}>
          {getTypeLabel(productTemplate.type)}
        </TypeBadge>
      ),
      width: '10%',
    },
    {
      key: 'name',
      header: '품목명',
      render: (productTemplate: ProductTemplate) => (
        <div>
          <ProductTemplateName>{productTemplate.name}</ProductTemplateName>
        </div>
      ),
      width: '30%',
    },
    {
      key: 'brand',
      header: '브랜드',
      render: (productTemplate: ProductTemplate) => (
        <BrandName>{productTemplate.brand.name}</BrandName>
      ),
      width: '20%',
    },
    {
      key: 'isIntegrated',
      header: '연동여부',
      render: (productTemplate: ProductTemplate) => (
        <StatusValue>{productTemplate.isIntegrated ? 'Y' : 'N'}</StatusValue>
      ),
      width: '12%',
    },
    {
      key: 'useStock',
      header: '재고관리',
      render: (productTemplate: ProductTemplate) => (
        <StatusValue>{productTemplate.useStock ? 'Y' : 'N'}</StatusValue>
      ),
      width: '12%',
    },
    {
      key: 'createdAt',
      header: '등록일',
      render: (productTemplate: ProductTemplate) => (
        <CreatedAt>
          {new Date(productTemplate.createdAt).toLocaleDateString('ko-KR')}
        </CreatedAt>
      ),
      width: '16%',
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

// 타입별 색상 스타일
const TypeBadge = tw.div<{ type: string }>`
  inline-flex
  items-center
  px-2.5
  py-0.5
  rounded-full
  text-xs
  font-medium
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
`;

// 브랜드명 표시
const BrandName = tw.div`
  text-sm
  text-gray-900
`;

// Y/N 상태 표시 - 작은 회색 텍스트
const StatusValue = tw.div`
  text-sm
  font-medium
  text-gray-900
`;

// 등록일 표시
const CreatedAt = tw.div`
  text-sm
  text-gray-500
`;

// 새 품목 등록 버튼 - 파란색 배경의 액션 버튼
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
