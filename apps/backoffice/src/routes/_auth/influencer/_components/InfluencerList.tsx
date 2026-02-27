/**
 * InfluencerList - 인플루언서 목록 컴포넌트
 *
 * 인플루언서 목록을 테이블 형태로 표시합니다.
 * 검색 기능과 수정 버튼을 제공합니다.
 */

import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Input, EmptyState, Table, ListPageLayout } from '@/shared/components';
import { trpc, type RouterOutputs } from '@/shared/trpc';

type InfluencerListItem =
  RouterOutputs['backofficeInfluencer']['findAll']['data'][number];

const columnHelper = createColumnHelper<InfluencerListItem>();

export function InfluencerList() {
  const navigate = useNavigate();
  const [influencers] = trpc.backofficeInfluencer.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const influencerData = influencers?.data || [];

  // 검색 필터링
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery.trim()) return influencerData;
    const query = searchQuery.toLowerCase();
    return influencerData.filter(
      (influencer) =>
        influencer.name.toLowerCase().includes(query) ||
        influencer.email?.toLowerCase().includes(query) ||
        influencer.phoneNumber?.toLowerCase().includes(query),
    );
  }, [influencerData, searchQuery]);

  const columns = [
    columnHelper.accessor('name', {
      header: '인플루언서명',
      size: 160,
    }),
    columnHelper.accessor('email', {
      header: '이메일',
      cell: (info) => info.getValue() || '-',
      size: 200,
    }),
    columnHelper.accessor('phoneNumber', {
      header: '연락처',
      cell: (info) => info.getValue() || '-',
      size: 160,
    }),
    columnHelper.accessor('createdAt', {
      header: '등록일',
      cell: (info) => dayjs(info.getValue()).format('YY.MM.DD'),
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Link
          to="/influencer/$influencerId"
          params={{ influencerId: String(info.row.original.id) }}
        >
          <Button
            kind="neutral"
            variant="outline"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            수정
          </Button>
        </Link>
      ),
      size: 100,
    }),
  ];

  const handleRowClick = (influencer: InfluencerListItem) => {
    navigate({
      to: '/influencer/$influencerId',
      params: { influencerId: String(influencer.id) },
    });
  };

  if (!influencerData || influencerData.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="등록된 인플루언서가 없습니다"
        description="새로운 인플루언서를 등록하여 관리를 시작하세요."
        action={
          <Link to="/influencer/create">
            <Button kind="neutral" variant="solid" size="medium">
              첫 인플루언서 등록하기
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <ListPageLayout
      filters={
        <SearchWrapper>
          <Input
            prefix={<SearchIcon size={20} />}
            placeholder="인플루언서 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
      }
      table={
        filteredInfluencers.length > 0 ? (
          <Table
            columns={columns}
            data={filteredInfluencers}
            onRowClick={handleRowClick}
          />
        ) : (
          <NoResultsMessage>검색 결과가 없습니다.</NoResultsMessage>
        )
      }
    />
  );
}

const SearchWrapper = tw.div`
  w-[280px]
`;

const SearchIcon = tw(Search)`
  text-[var(--fg-neutral)]
`;

const NoResultsMessage = tw.div`
  text-center py-10
  text-[var(--fg-muted,#71717a)]
`;

/**
 * Usage:
 *
 * <InfluencerList />
 */
