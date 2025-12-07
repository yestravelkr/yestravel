import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';
import type { Brand } from '@/types/brand.type';

export function BrandList() {
  const navigate = useNavigate();
  const [brands] = trpc.backofficeBrand.findAll.useSuspenseQuery();

  const columnHelper = createColumnHelper<Brand>();

  const columns = [
    columnHelper.accessor('name', {
      header: '브랜드명',
      cell: (info) => (
        <div>
          <BrandName>{info.getValue()}</BrandName>
          {info.row.original.email && (
            <BrandEmail>{info.row.original.email}</BrandEmail>
          )}
        </div>
      ),
      size: 300,
    }),
    columnHelper.accessor('businessInfo', {
      header: '사업자 정보',
      cell: (info) => (
        <BusinessInfo>{info.getValue()?.name || '-'}</BusinessInfo>
      ),
      size: 250,
    }),
    columnHelper.accessor('phoneNumber', {
      header: '연락처',
      cell: (info) => <PhoneNumber>{info.getValue() || '-'}</PhoneNumber>,
      size: 200,
    }),
    columnHelper.accessor('createdAt', {
      header: '등록일',
      cell: (info) => (
        <CreatedAt>
          {new Date(info.getValue()).toLocaleDateString('ko-KR')}
        </CreatedAt>
      ),
      size: 250,
    }),
  ];

  const handleRowClick = (brand: Brand) => {
    navigate({ to: `/brand/${brand.id}` });
  };

  if (brands && brands.length > 0) {
    return (
      <Table columns={columns} data={brands} onRowClick={handleRowClick} />
    );
  }

  return (
    <EmptyState
      icon={<InboxIcon />}
      title="등록된 브랜드가 없습니다"
      description="새로운 브랜드를 등록하여 관리를 시작하세요."
      action={
        <CreateButton to="/brand/create">첫 브랜드 등록하기</CreateButton>
      }
    />
  );
}

const BrandName = tw.div`
  font-medium
  text-gray-900
`;

const BrandEmail = tw.div`
  text-sm
  text-gray-500
`;

const BusinessInfo = tw.div`
  text-sm
  text-gray-900
`;

const PhoneNumber = tw.div`
  text-sm
  text-gray-900
`;

const CreatedAt = tw.div`
  text-sm
  text-gray-500
`;

// 새 브랜드 등록 버튼 - 파란색 배경의 액션 버튼
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
