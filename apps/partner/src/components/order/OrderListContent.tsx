/**
 * OrderListContent - 숙박 주문 목록 공통 컴포넌트
 *
 * Brand/Influencer 주문 목록 페이지에서 공유하는 컴포넌트입니다.
 * admin-shared의 컴포넌트와 상수를 사용합니다.
 */

import { useNavigate } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import {
  OrderFilters,
  type OrderFiltersState,
  StatusTabs,
  Table,
  TableToolbar,
  Pagination,
  ORDER_STATUS_LABELS,
  ALERT_STATUSES,
  PERIOD_TYPE_OPTIONS,
  PERIOD_PRESET_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderStatusTab,
  type OrderListItem,
  PARTNER_CAPABILITIES,
  formatPrice,
  useAdminTrpc,
} from '@yestravelkr/admin-shared';
import dayjs from 'dayjs';
import { Suspense } from 'react';
import { toast } from 'sonner';

/** 검색 파라미터 타입 */
export interface HotelOrderSearchParams {
  page: number;
  limit: number;
  periodType: string;
  periodPreset: string;
  startDate: string;
  endDate: string;
  orderStatus: string;
  campaignId: string;
  influencerIds: string;
  productId: string;
  optionId: string;
  searchQuery: string;
}

/** 검색 파라미터 검증 함수 */
export function validateHotelOrderSearch(
  search: Record<string, unknown>,
): HotelOrderSearchParams {
  return {
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 50,
    periodType: (search.periodType as string) || '',
    periodPreset: (search.periodPreset as string) || '',
    startDate: (search.startDate as string) || '',
    endDate: (search.endDate as string) || '',
    orderStatus: (search.orderStatus as string) || '',
    campaignId: (search.campaignId as string) || '',
    influencerIds: (search.influencerIds as string) || '',
    productId: (search.productId as string) || '',
    optionId: (search.optionId as string) || '',
    searchQuery: (search.searchQuery as string) || '',
  };
}

interface OrderListContentProps {
  /** 기본 경로 (예: /brand/order/hotel) */
  basePath: string;
  /** 현재 검색 파라미터 */
  searchParams: HotelOrderSearchParams;
  /** 검색 파라미터 변경 핸들러 */
  onSearchParamsChange: (params: Partial<HotelOrderSearchParams>) => void;
}

/**
 * Usage:
 * <OrderListContent
 *   basePath="/brand/order/hotel"
 *   searchParams={searchParams}
 *   onSearchParamsChange={(params) => navigate({ search: { ...searchParams, ...params } })}
 * />
 */
export function OrderListContent({
  basePath,
  searchParams,
  onSearchParamsChange,
}: OrderListContentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">숙박 주문 관리</h1>
      <Suspense
        fallback={<div className="text-[var(--fg-muted)] py-8">로딩 중...</div>}
      >
        <OrderListInner
          basePath={basePath}
          searchParams={searchParams}
          onSearchParamsChange={onSearchParamsChange}
        />
      </Suspense>
    </div>
  );
}

const columnHelper = createColumnHelper<OrderListItem>();

function OrderListInner({
  basePath,
  searchParams,
  onSearchParamsChange,
}: OrderListContentProps) {
  const trpc = useAdminTrpc();
  const navigate = useNavigate();

  const {
    page,
    limit,
    periodType,
    periodPreset,
    startDate,
    endDate,
    orderStatus,
    campaignId,
    influencerIds,
    productId,
    searchQuery,
  } = searchParams;

  const statusFilter: OrderStatusTab = (orderStatus as OrderStatusTab) || 'ALL';

  const filterParams = {
    type: 'HOTEL' as const,
    periodFilterType:
      (periodType as 'PAYMENT_DATE' | 'ORDER_DATE' | 'USAGE_DATE') || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    campaignId: campaignId ? parseInt(campaignId, 10) : undefined,
    influencerIds: influencerIds
      ? influencerIds.split(',').filter(Boolean).map(Number)
      : undefined,
    productId: productId ? parseInt(productId, 10) : undefined,
    searchQuery: searchQuery || undefined,
  };

  const [ordersData] = trpc.backofficeOrder.findAll.useSuspenseQuery({
    ...filterParams,
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const [statusCounts] =
    trpc.backofficeOrder.getStatusCounts.useSuspenseQuery(filterParams);

  const [filterOptions] =
    trpc.backofficeOrder.getFilterOptions.useSuspenseQuery();

  const exportToExcelMutation = trpc.backofficeOrder.exportToExcel.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${data.totalCount}건의 주문이 엑셀로 다운로드됩니다.`);
    },
    onError: (error) => {
      toast.error(error.message || '엑셀 다운로드에 실패했습니다.');
    },
  });

  const handleExcelDownload = () => {
    exportToExcelMutation.mutate({
      ...filterParams,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    });
  };

  const columns = [
    columnHelper.accessor('orderNumber', {
      header: '주문번호',
      size: 100,
    }),
    columnHelper.accessor('displayStatus', {
      header: '주문상태',
      cell: (info) =>
        ORDER_STATUS_LABELS[
          info.getValue() as keyof typeof ORDER_STATUS_LABELS
        ] || info.getValue(),
      size: 90,
    }),
    columnHelper.accessor('createdAt', {
      header: '주문일시',
      cell: (info) => dayjs(info.getValue()).format('YY/MM/DD HH:mm'),
      size: 120,
    }),
    columnHelper.accessor('campaignName', {
      header: '캠페인',
      size: 100,
    }),
    columnHelper.accessor('influencerName', {
      header: '인플루언서',
      size: 160,
    }),
    columnHelper.accessor('productName', {
      header: '상품',
      size: 120,
    }),
    columnHelper.accessor('hotelOptionName', {
      header: '옵션',
      cell: (info) => info.getValue() || '-',
      size: 80,
    }),
    columnHelper.display({
      id: 'usageDate',
      header: '이용일',
      cell: (info) => {
        const checkIn = info.row.original.checkInDate;
        const checkOut = info.row.original.checkOutDate;
        if (!checkIn || !checkOut) return '-';
        return `${checkIn} ~ ${checkOut}`;
      },
      size: 140,
    }),
    columnHelper.accessor('totalAmount', {
      header: '결제금액',
      cell: (info) => formatPrice(info.getValue()),
      size: 100,
    }),
    columnHelper.accessor('customerName', {
      header: '구매자',
      size: 80,
    }),
    columnHelper.accessor('customerPhone', {
      header: '구매자 연락처',
      size: 130,
    }),
  ];

  const orders = ordersData.data;
  const totalCount = ordersData.total;
  const totalPages = ordersData.totalPages;

  const campaignOptions = filterOptions.campaigns.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const influencerOptions = filterOptions.influencers.map((i) => ({
    value: String(i.id),
    label: i.name,
  }));

  const productOptions = filterOptions.products.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const optionOptions: { value: string; label: string }[] = [];

  const influencerIdsArray = influencerIds
    ? influencerIds.split(',').filter(Boolean)
    : [];

  const filters: OrderFiltersState = {
    periodType,
    periodPreset,
    startDate,
    endDate,
    orderStatus: orderStatus || null,
    campaignId: campaignId || null,
    influencerIds: influencerIdsArray,
    productId: productId || null,
    optionId: null,
    searchQuery,
  };

  const handlePageChange = (newPage: number) => {
    onSearchParamsChange({ page: newPage });
  };

  const handlePageSizeChange = (newLimit: number) => {
    onSearchParamsChange({ page: 1, limit: newLimit });
  };

  const handleFiltersChange = (updates: Partial<OrderFiltersState>) => {
    const newParams: Partial<HotelOrderSearchParams> = { page: 1 };

    if (updates.periodType !== undefined) {
      newParams.periodType = updates.periodType;
    }
    if (updates.periodPreset !== undefined) {
      newParams.periodPreset = updates.periodPreset;
    }
    if (updates.startDate !== undefined) {
      newParams.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      newParams.endDate = updates.endDate;
    }
    if (updates.orderStatus !== undefined) {
      newParams.orderStatus = updates.orderStatus || '';
    }
    if (updates.campaignId !== undefined) {
      newParams.campaignId = updates.campaignId || '';
    }
    if (updates.influencerIds !== undefined) {
      newParams.influencerIds = updates.influencerIds.join(',');
    }
    if (updates.productId !== undefined) {
      newParams.productId = updates.productId || '';
    }
    if (updates.optionId !== undefined) {
      newParams.optionId = updates.optionId || '';
    }
    if (updates.searchQuery !== undefined) {
      newParams.searchQuery = updates.searchQuery;
    }

    onSearchParamsChange(newParams);
  };

  const handleStatusTabChange = (tab: OrderStatusTab) => {
    onSearchParamsChange({
      page: 1,
      orderStatus: tab === 'ALL' ? '' : tab,
    });
  };

  const tabOrder: OrderStatusTab[] = [
    'ALL',
    'PAID',
    'PENDING_RESERVATION',
    'RESERVATION_CONFIRMED',
    'COMPLETED',
    'CANCEL_REQUESTED',
    'CANCELLED',
  ];

  const statusTabs = tabOrder.map((key) => ({
    key,
    label: ORDER_STATUS_LABELS[key],
    count: statusCounts[key],
    hasAlert:
      (ALERT_STATUSES as string[]).includes(key) && statusCounts[key] > 0,
  }));

  const handleRowClick = (order: OrderListItem) => {
    navigate({
      to: `${basePath}/$orderId`,
      params: { orderId: String(order.id) },
    });
  };

  return (
    <>
      <StatusTabs
        tabs={statusTabs}
        activeTab={statusFilter}
        onTabChange={handleStatusTabChange}
      />
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        periodTypeOptions={PERIOD_TYPE_OPTIONS}
        periodPresetOptions={PERIOD_PRESET_OPTIONS}
        orderStatusOptions={ORDER_STATUS_OPTIONS}
        campaignOptions={campaignOptions}
        influencerOptions={influencerOptions}
        productOptions={productOptions}
        optionOptions={optionOptions}
        onExcelDownload={handleExcelDownload}
        capabilities={PARTNER_CAPABILITIES}
      />
      <TableToolbar
        label="주문"
        totalCount={totalCount}
        pageSize={limit}
        onPageSizeChange={handlePageSizeChange}
      />
      <Table columns={columns} data={orders} onRowClick={handleRowClick} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
