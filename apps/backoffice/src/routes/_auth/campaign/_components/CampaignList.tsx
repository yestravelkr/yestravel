import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import tw from 'tailwind-styled-components';

import { EmptyState } from '@/shared/components';
import { trpc, type RouterOutputs } from '@/shared/trpc';

type Campaign = RouterOutputs['backofficeCampaign']['findAll'][number];

export function CampaignList() {
  const [campaigns] = trpc.backofficeCampaign.findAll.useSuspenseQuery();

  if (!campaigns || campaigns.length === 0) {
    return (
      <EmptyState
        title="등록된 캠페인이 없습니다"
        description="새 캠페인을 생성하여 시작하세요"
        actionLabel="캠페인 생성"
        actionTo="/campaign/create"
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <TableRow>
            <TableHeader>캠페인명</TableHeader>
            <TableHeader>시작일</TableHeader>
            <TableHeader>종료일</TableHeader>
            <TableHeader>설명</TableHeader>
            <TableHeader>등록일</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

function CampaignRow({ campaign }: { campaign: Campaign }) {
  return (
    <TableRow>
      <TableCell>
        <CampaignLink to={`/campaign/${campaign.id}`}>
          {campaign.title}
        </CampaignLink>
      </TableCell>
      <TableCell>{dayjs(campaign.startAt).format('YYYY-MM-DD')}</TableCell>
      <TableCell>{dayjs(campaign.endAt).format('YYYY-MM-DD')}</TableCell>
      <TableCell>{campaign.description || '-'}</TableCell>
      <TableCell>{dayjs(campaign.createdAt).format('YYYY-MM-DD')}</TableCell>
    </TableRow>
  );
}

const TableContainer = tw.div`
  w-full
  overflow-x-auto
  bg-white
  rounded-lg
  shadow-sm
`;

const Table = tw.table`
  w-full
  border-collapse
`;

const TableRow = tw.tr`
  border-b
  border-gray-100
  last:border-b-0
  hover:bg-gray-50
  transition-colors
`;

const TableHeader = tw.th`
  px-6
  py-4
  text-left
  text-sm
  font-semibold
  text-gray-700
  bg-gray-50
  first:rounded-tl-lg
  last:rounded-tr-lg
`;

const TableCell = tw.td`
  px-6
  py-4
  text-sm
  text-gray-600
`;

const CampaignLink = tw(Link)`
  text-blue-600
  hover:text-blue-800
  hover:underline
  font-medium
`;
