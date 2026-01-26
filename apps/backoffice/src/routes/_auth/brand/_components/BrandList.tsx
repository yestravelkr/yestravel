/**
 * BrandList - 브랜드 목록 컴포넌트
 *
 * 브랜드 목록을 테이블 형태로 표시합니다.
 * 검색 기능과 수정/삭제 버튼을 제공합니다.
 */

import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import {
  Input,
  EmptyState,
  Table,
  ListPageLayout,
  openDeleteConfirmModal,
} from '@/shared/components';
import { trpc } from '@/shared/trpc';
import type { Brand } from '@/types/brand.type';

const columnHelper = createColumnHelper<Brand>();

export function BrandList() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [brands] = trpc.backofficeBrand.findAll.useSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState('');

  // 브랜드 삭제 mutation
  const deleteMutation = trpc.backofficeBrand.delete.useMutation({
    onSuccess: () => {
      toast.success('브랜드가 삭제되었습니다.');
      utils.backofficeBrand.findAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || '브랜드 삭제에 실패했습니다.');
    },
  });

  // 검색 필터링
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brands, searchQuery]);

  const handleEdit = (brand: Brand) => {
    navigate({ to: `/brand/${brand.id}` });
  };

  const handleDelete = async (brand: Brand) => {
    const confirmed = await openDeleteConfirmModal({
      targetName: '브랜드',
    });

    if (confirmed) {
      await deleteMutation.mutateAsync({ id: brand.id });
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: '브랜드명',
      size: 160,
    }),
    columnHelper.accessor('businessInfo', {
      header: '사업자명',
      cell: (info) => info.getValue()?.name || '-',
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
        <ActionButtons>
          <Button
            kind="neutral"
            variant="outline"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(info.row.original);
            }}
          >
            수정
          </Button>
          <Button
            kind="critical"
            variant="outline"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(info.row.original);
            }}
          >
            삭제
          </Button>
        </ActionButtons>
      ),
      size: 140,
    }),
  ];

  const handleRowClick = (brand: Brand) => {
    navigate({ to: `/brand/${brand.id}` });
  };

  if (!brands || brands.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="등록된 브랜드가 없습니다"
        description="새로운 브랜드를 등록하여 관리를 시작하세요."
        action={
          <Link to="/brand/create">
            <Button kind="neutral" variant="solid" size="medium">
              첫 브랜드 등록하기
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
            placeholder="브랜드명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
      }
      table={
        filteredBrands.length > 0 ? (
          <Table
            columns={columns}
            data={filteredBrands}
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

const ActionButtons = tw.div`
  flex items-center gap-1
`;

const NoResultsMessage = tw.div`
  text-center py-10
  text-[var(--fg-muted,#71717a)]
`;

/**
 * Usage:
 *
 * <BrandList />
 */
