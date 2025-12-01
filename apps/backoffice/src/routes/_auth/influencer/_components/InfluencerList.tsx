import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';

// Influencer 타입 정의 (API 응답 기반)
interface Influencer {
  id: number;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  instagramHandle?: string | null;
  followerCount?: number | null;
  createdAt: string;
}

export function InfluencerList() {
  const navigate = useNavigate();

  const [influencers] = trpc.backofficeInfluencer.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });

  const columnHelper = createColumnHelper<Influencer>();

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
    columnHelper.accessor('instagramHandle', {
      header: '인스타그램',
      cell: (info) => (
        <InstagramHandle>
          {info.getValue() ? `@${info.getValue()}` : '-'}
        </InstagramHandle>
      ),
      size: 250,
    }),
    columnHelper.accessor('followerCount', {
      header: '팔로워',
      cell: (info) => (
        <FollowerCount>
          {info.getValue() ? `${info.getValue()?.toLocaleString()}명` : '-'}
        </FollowerCount>
      ),
      size: 150,
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
      size: 150,
    }),
  ];

  const handleRowClick = (influencer: Influencer) => {
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

const InstagramHandle = tw.div`
  text-sm
  text-gray-900
`;

const FollowerCount = tw.div`
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
