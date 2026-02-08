/**
 * Settlement List Page - 정산 관리 페이지
 *
 * 인플루언서/브랜드 정산 목록을 조회하고 관리하는 페이지입니다.
 * URL: /settlement?page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@yestravelkr/api-types';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import {
  SettlementFilters,
  type SettlementFiltersState,
} from './_components/SettlementFilters';

import { MajorPageLayout } from '@/components/layout';
import {
  ListPageLayout,
  openConfirmModal,
  Pagination,
  StatusTabs,
  Table,
  TableToolbar,
} from '@/shared/components';
import { trpc } from '@/shared/trpc';

/** 정산 상태 */
type SettlementStatus = 'PENDING' | 'COMPLETED';

/** 상태 탭 타입 */
type SettlementStatusTab = 'ALL' | SettlementStatus;

/** 상태별 라벨 */
const SETTLEMENT_STATUS_LABELS: Record<SettlementStatusTab, string> = {
  ALL: '전체',
  PENDING: '정산대기',
  COMPLETED: '정산완료',
};

/** 정산 대상 유형 */
const TARGET_TYPE_OPTIONS = [
  { value: 'INFLUENCER', label: '인플루언서' },
  { value: 'BRAND', label: '브랜드' },
];

interface SettlementSearchParams {
  page: number;
  limit: number;
  status: string;
  targetType: string;
  campaignId: string;
  targetId: string;
  periodYear: string;
  periodMonth: string;
}

export const Route = createFileRoute('/_auth/settlement/')({
  component: SettlementListPage,
  validateSearch: (search: Record<string, unknown>): SettlementSearchParams => {
    return {
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 50,
      status: (search.status as string) || '',
      targetType: (search.targetType as string) || '',
      campaignId: (search.campaignId as string) || '',
      targetId: (search.targetId as string) || '',
      periodYear: (search.periodYear as string) || '',
      periodMonth: (search.periodMonth as string) || '',
    };
  },
});

/** 정산 데이터 타입 - API 응답에서 추론 */
type RouterOutput = inferRouterOutputs<AppRouter>;
type Settlement =
  RouterOutput['backofficeSettlement']['findAll']['data'][number];

const columnHelper = createColumnHelper<Settlement>();

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

function SettlementListPage() {
  const searchParams = Route.useSearch();
  const {
    page,
    limit,
    status,
    targetType,
    campaignId,
    targetId,
    periodYear,
    periodMonth,
  } = searchParams;

  const navigate = Route.useNavigate();

  const statusFilter: SettlementStatusTab =
    (status as SettlementStatusTab) || 'ALL';

  // API 호출
  const [settlementsData] = trpc.backofficeSettlement.findAll.useSuspenseQuery({
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    targetType: targetType ? (targetType as 'INFLUENCER' | 'BRAND') : undefined,
    campaignId: campaignId ? parseInt(campaignId, 10) : undefined,
    targetId: targetId ? parseInt(targetId, 10) : undefined,
    periodYear: periodYear ? parseInt(periodYear, 10) : undefined,
    periodMonth: periodMonth ? parseInt(periodMonth, 10) : undefined,
  });

  const [filterOptions] =
    trpc.backofficeSettlement.getFilterOptions.useSuspenseQuery();

  const trpcUtils = trpc.useUtils();

  // 인플루언서 정산 완료 Mutation
  const completeInfluencerMutation =
    trpc.backofficeSettlement.completeInfluencerSettlements.useMutation({
      onSuccess: () => {
        trpcUtils.backofficeSettlement.findAll.invalidate();
        toast.success('정산이 완료되었습니다.');
      },
      onError: (error) => {
        toast.error(error.message || '정산 완료에 실패했습니다.');
      },
    });

  // 브랜드 정산 완료 Mutation
  const completeBrandMutation =
    trpc.backofficeSettlement.completeBrandSettlements.useMutation({
      onSuccess: () => {
        trpcUtils.backofficeSettlement.findAll.invalidate();
        toast.success('정산이 완료되었습니다.');
      },
      onError: (error) => {
        toast.error(error.message || '정산 완료에 실패했습니다.');
      },
    });

  /** 정산 완료 처리 */
  const handleComplete = async (settlement: Settlement) => {
    const confirmed = await openConfirmModal({
      title: '정산을 완료 처리하시겠습니까?',
    });

    if (confirmed) {
      if (settlement.targetType === 'INFLUENCER') {
        completeInfluencerMutation.mutate({ ids: [settlement.id] });
      } else {
        completeBrandMutation.mutate({ ids: [settlement.id] });
      }
    }
  };

  /** 테이블 컬럼 정의 */
  const columns = [
    columnHelper.accessor('scheduledAt', {
      header: '정산예정일',
      cell: (info) => dayjs(info.getValue()).format('YY.MM.DD'),
      size: 100,
    }),
    columnHelper.accessor('status', {
      header: '정산상태',
      cell: (info) => SETTLEMENT_STATUS_LABELS[info.getValue()],
      size: 90,
    }),
    columnHelper.accessor('targetType', {
      header: '정산대상 유형',
      cell: (info) =>
        info.getValue() === 'INFLUENCER' ? '인플루언서' : '브랜드',
      size: 110,
    }),
    columnHelper.accessor('targetName', {
      header: '정산대상',
      size: 120,
    }),
    columnHelper.display({
      id: 'period',
      header: '정산기간',
      cell: (info) =>
        `${info.row.original.periodYear}년 ${info.row.original.periodMonth}월`,
      size: 100,
    }),
    columnHelper.accessor('campaignNames', {
      header: '캠페인',
      cell: (info) => {
        const names = info.getValue();
        if (names.length === 0) return '-';
        if (names.length === 1) return names[0];
        return `${names[0]} 외 ${names.length - 1}개`;
      },
      size: 150,
    }),
    columnHelper.accessor('totalSales', {
      header: '매출',
      cell: (info) => formatPrice(info.getValue()),
      size: 120,
    }),
    columnHelper.accessor('totalAmount', {
      header: '정산금액',
      cell: (info) => formatPrice(info.getValue()),
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const settlement = info.row.original;
        if (settlement.status === 'COMPLETED') return null;

        return (
          <Button
            kind="neutral"
            variant="solid"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete(settlement);
            }}
          >
            정산완료
          </Button>
        );
      },
      size: 100,
    }),
  ];

  const settlements = settlementsData.data;
  const totalCount = settlementsData.total;
  const totalPages = settlementsData.totalPages;

  // 상태별 카운트 (API 응답에서 제공)
  const pendingCount = settlementsData.statusCounts?.pending ?? 0;
  const completedCount = settlementsData.statusCounts?.completed ?? 0;

  const statusTabs = [
    { key: 'ALL' as const, label: '전체', count: totalCount },
    {
      key: 'PENDING' as const,
      label: '정산대기',
      count: pendingCount,
      hasAlert: pendingCount > 0,
    },
    { key: 'COMPLETED' as const, label: '정산완료', count: completedCount },
  ];

  const campaignOptions = filterOptions.campaigns.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const influencerOptions = filterOptions.influencers.map((i) => ({
    value: String(i.id),
    label: i.name,
  }));

  const brandOptions = filterOptions.brands.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));

  const periodOptions = filterOptions.periods.map((p) => ({
    value: `${p.year}-${p.month}`,
    label: p.label,
  }));

  const filters: SettlementFiltersState = {
    targetType: targetType || null,
    campaignId: campaignId || null,
    targetId: targetId || null,
    periodYear: periodYear || null,
    periodMonth: periodMonth || null,
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { ...searchParams, page: newPage } });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({ search: { ...searchParams, page: 1, limit: newLimit } });
  };

  const handleFiltersChange = (updates: Partial<SettlementFiltersState>) => {
    const newSearchParams: Partial<SettlementSearchParams> = { page: 1 };

    if (updates.targetType !== undefined) {
      newSearchParams.targetType = updates.targetType || '';
    }
    if (updates.campaignId !== undefined) {
      newSearchParams.campaignId = updates.campaignId || '';
    }
    if (updates.targetId !== undefined) {
      newSearchParams.targetId = updates.targetId || '';
    }
    if (updates.periodYear !== undefined) {
      newSearchParams.periodYear = updates.periodYear || '';
    }
    if (updates.periodMonth !== undefined) {
      newSearchParams.periodMonth = updates.periodMonth || '';
    }

    navigate({ search: { ...searchParams, ...newSearchParams } });
  };

  const handleStatusTabChange = (tab: SettlementStatusTab) => {
    navigate({
      search: {
        ...searchParams,
        page: 1,
        status: tab === 'ALL' ? '' : tab,
      },
    });
  };

  const handleRowClick = (settlement: Settlement) => {
    if (settlement.targetType === 'INFLUENCER') {
      navigate({
        to: '/settlement/influencer/$settlementId',
        params: { settlementId: String(settlement.id) },
      });
    } else {
      navigate({
        to: '/settlement/brand/$settlementId',
        params: { settlementId: String(settlement.id) },
      });
    }
  };

  return (
    <MajorPageLayout title="정산 관리">
      <ListPageLayout
        tabs={
          <StatusTabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onTabChange={handleStatusTabChange}
          />
        }
        filters={
          <SettlementFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            targetTypeOptions={TARGET_TYPE_OPTIONS}
            campaignOptions={campaignOptions}
            influencerOptions={influencerOptions}
            brandOptions={brandOptions}
            periodOptions={periodOptions}
          />
        }
        toolbar={
          <TableToolbar
            label="정산"
            totalCount={totalCount}
            pageSize={limit}
            onPageSizeChange={handlePageSizeChange}
          />
        }
        table={
          <Table
            columns={columns}
            data={settlements}
            onRowClick={handleRowClick}
          />
        }
        pagination={
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        }
      />
    </MajorPageLayout>
  );
}
