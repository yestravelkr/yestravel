import { Link } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { ExternalLink } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { openSalesLinkModal } from './SalesLinkModal';

import { EmptyState } from '@/shared/components';
import { trpc, type RouterOutputs } from '@/shared/trpc';

type Campaign = RouterOutputs['backofficeCampaign']['findAll']['data'][number];

export function CampaignList() {
  const [result] = trpc.backofficeCampaign.findAll.useSuspenseQuery();
  const campaigns = result.data;

  if (!campaigns || campaigns.length === 0) {
    return (
      <EmptyState
        title="등록된 캠페인이 없습니다"
        description="새 캠페인을 생성하여 시작하세요"
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
            <TableHeader>등록일</TableHeader>
            <TableHeader>부가기능</TableHeader>
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
  const utils = trpc.useUtils();

  const handleOpenSalesLink = async () => {
    // 버튼 클릭 시에만 캠페인 상세 조회
    const campaignDetail = await utils.backofficeCampaign.findById.fetch({
      id: campaign.id,
    });

    openSalesLinkModal({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      influencers: campaignDetail.influencers.map((inf) => ({
        influencerId: inf.influencerId,
        name: inf.name,
        slug: inf.slug,
        thumbnail: inf.thumbnail,
      })),
    });
  };

  return (
    <TableRow>
      <TableCell>
        <CampaignLink to={`/campaign/${campaign.id}`}>
          {campaign.title}
        </CampaignLink>
      </TableCell>
      <TableCell>{dayjs(campaign.startAt).format('YYYY-MM-DD')}</TableCell>
      <TableCell>{dayjs(campaign.endAt).format('YYYY-MM-DD')}</TableCell>
      <TableCell>{dayjs(campaign.createdAt).format('YYYY-MM-DD')}</TableCell>
      <TableCell>
        <Button
          kind="neutral"
          variant="outline"
          size="small"
          onClick={handleOpenSalesLink}
          leadingIcon={<ExternalLink size={16} />}
        >
          판매링크
        </Button>
      </TableCell>
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
