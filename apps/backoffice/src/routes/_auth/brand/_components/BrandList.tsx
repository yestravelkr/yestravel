import { useNavigate, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';
import type { Brand } from '@/types/brand.type';

export function BrandList() {
  const navigate = useNavigate();
  const [brands] = trpc.backofficeBrand.findAll.useSuspenseQuery();

  const columns = [
    {
      key: 'name',
      header: '브랜드명',
      render: (brand: Brand) => (
        <div>
          <BrandName>{brand.name}</BrandName>
          {brand.email && <BrandEmail>{brand.email}</BrandEmail>}
        </div>
      ),
      width: '30%',
    },
    {
      key: 'businessInfo',
      header: '사업자 정보',
      render: (brand: Brand) => (
        <BusinessInfo>{brand.businessInfo?.name || '-'}</BusinessInfo>
      ),
      width: '25%',
    },
    {
      key: 'phoneNumber',
      header: '연락처',
      render: (brand: Brand) => (
        <PhoneNumber>{brand.phoneNumber || '-'}</PhoneNumber>
      ),
      width: '20%',
    },
    {
      key: 'createdAt',
      header: '등록일',
      render: (brand: Brand) => (
        <CreatedAt>
          {new Date(brand.createdAt).toLocaleDateString('ko-KR')}
        </CreatedAt>
      ),
      width: '25%',
    },
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
