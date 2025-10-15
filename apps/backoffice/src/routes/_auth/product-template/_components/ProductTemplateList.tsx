import { useNavigate, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
// TODO: trpc import 필요
// import { trpc } from '@/shared/trpc';

export function ProductTemplateList() {
  const navigate = useNavigate();

  // TODO: 실제 productTemplate API 연결 시 주석 해제
  // const [productTemplates] = trpc.backofficeProductTemplate.findAll.useSuspenseQuery();
  const productTemplates: any[] = []; // 임시 빈 배열

  const columns = [
    {
      key: 'name',
      header: '품목명',
      render: (productTemplate: any) => (
        <div>
          <ProductTemplateName>{productTemplate.name}</ProductTemplateName>
          {productTemplate.description && (
            <ProductTemplateDescription>
              {productTemplate.description}
            </ProductTemplateDescription>
          )}
        </div>
      ),
      width: '35%',
    },
    {
      key: 'brand',
      header: '브랜드',
      render: (productTemplate: any) => (
        <BrandName>{productTemplate.brand || '-'}</BrandName>
      ),
      width: '25%',
    },
    {
      key: 'isConnected',
      header: '연동여부',
      render: (productTemplate: any) => (
        <StatusValue>{productTemplate.isConnected ? 'Y' : 'N'}</StatusValue>
      ),
      width: '15%',
    },
    {
      key: 'hasInventoryManagement',
      header: '재고관리 여부',
      render: (productTemplate: any) => (
        <StatusValue>
          {productTemplate.hasInventoryManagement ? 'Y' : 'N'}
        </StatusValue>
      ),
      width: '25%',
    },
  ];

  const handleRowClick = (productTemplate: any) => {
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

// 품목명 표시 - 굵은 글씨로 강조
const ProductTemplateName = tw.div`
  font-medium
  text-gray-900
`;

// 품목 설명 - 작은 회색 텍스트
const ProductTemplateDescription = tw.div`
  text-sm
  text-gray-500
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
