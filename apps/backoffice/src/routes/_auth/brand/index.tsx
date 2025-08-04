import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import type { Brand } from '@yestravelkr/yestravel-schema';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState, TableSkeleton } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/brand/')({
  component: BrandListPage,
});

function BrandListPage() {
  const navigate = useNavigate();
  const { data: brands, isLoading } = trpc.backofficeBrand.findAll.useQuery();

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

  return (
    <Container>
      <Header>
        <Title>브랜드 관리</Title>
        <CreateButton to="/brand/create">새 브랜드 등록</CreateButton>
      </Header>

      <Content>
        {isLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : brands && brands.length > 0 ? (
          <Table columns={columns} data={brands} onRowClick={handleRowClick} />
        ) : (
          <EmptyState
            icon={<InboxIcon />}
            title="등록된 브랜드가 없습니다"
            description="새로운 브랜드를 등록하여 관리를 시작하세요."
            action={
              <CreateButton to="/brand/create">첫 브랜드 등록하기</CreateButton>
            }
          />
        )}
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

const Content = tw.div``;

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
