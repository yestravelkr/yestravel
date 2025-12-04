import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc, type RouterOutputs } from '@/shared/trpc';

// tRPC에서 타입 추출
type InfluencerListItem =
  RouterOutputs['backofficeInfluencer']['findAll']['data'][number];

export function InfluencerList() {
  const navigate = useNavigate();

  const [influencers] = trpc.backofficeInfluencer.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });

  const columnHelper = createColumnHelper<InfluencerListItem>();

  const columns = [
    columnHelper.accessor('name', {
      header: '이름',
      cell: (info) => (
        <div>
          <InfluencerName>{info.getValue()}</InfluencerName>
          {info.row.original.email && (
            <InfluencerEmail>{info.row.original.email}</InfluencerEmail>
          )}
        </div>
      ),
      size: 300,
    }),
    columnHelper.accessor('phoneNumber', {
      header: '연락처',
      cell: (info) => <PhoneNumber>{info.getValue() || '-'}</PhoneNumber>,
      size: 200,
    }),
    columnHelper.accessor('createdAt', {
      header: '등록일',
      cell: (info) => (
        <CreatedAt>{dayjs(info.getValue()).format('YYYY-MM-DD')}</CreatedAt>
      ),
      size: 150,
    }),
  ];

  const handleRowClick = (influencer: InfluencerListItem) => {
    navigate({ to: `/influencer/${influencer.id}` });
  };

  const influencerData = influencers?.data || [];

  if (influencerData.length > 0) {
    return (
      <Table
        columns={columns}
        data={influencerData}
        onRowClick={handleRowClick}
      />
    );
  }

  return (
    <EmptyState
      icon={<InboxIcon />}
      title="등록된 인플루언서가 없습니다"
      description="새로운 인플루언서를 등록하여 관리를 시작하세요."
      action={
        <CreateButton to="/influencer/create">
          첫 인플루언서 등록하기
        </CreateButton>
      }
    />
  );
}

const InfluencerName = tw.div`
  font-medium
  text-gray-900
`;

const InfluencerEmail = tw.div`
  text-sm
  text-gray-500
`;

const PhoneNumber = tw.div`
  text-sm
  text-gray-900
`;

const CreatedAt = tw.div`
  text-sm
  text-gray-500
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
  inline-block
`;
