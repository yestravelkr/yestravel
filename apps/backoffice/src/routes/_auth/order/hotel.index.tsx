/**
 * Hotel Order List Page - 숙박 주문 관리 페이지
 *
 * 숙박 주문 목록을 조회하고 관리하는 페이지입니다.
 * URL: /order/hotel?page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@yestravelkr/min-design-system';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import {
  OrderFilters,
  type OrderFiltersState,
} from './_components/OrderFilters';

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

/** 주문 상태 (14개) */
type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PENDING_RESERVATION'
  | 'RESERVATION_CONFIRMED'
  | 'COMPLETED'
  | 'PREPARING_SHIPMENT'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'PURCHASE_CONFIRMED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNING'
  | 'RETURNED';

/** 상태 탭 타입 (전체 주문 포함) */
type OrderStatusTab = 'ALL' | OrderStatus;

/** 상태별 라벨 */
const ORDER_STATUS_LABELS: Record<OrderStatusTab, string> = {
  ALL: '전체 주문',
  PENDING: '결제대기',
  PAID: '결제완료',
  PENDING_RESERVATION: '예약대기',
  RESERVATION_CONFIRMED: '예약확정',
  COMPLETED: '이용완료',
  PREPARING_SHIPMENT: '배송준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  CANCEL_REQUESTED: '취소요청',
  CANCELLED: '취소완료',
  RETURN_REQUESTED: '반품요청',
  RETURNING: '반품중',
  RETURNED: '반품완료',
};

/** 알림 표시가 필요한 상태 (빨간 점) */
const ALERT_STATUSES: OrderStatusTab[] = ['PAID'];

/** 기간 타입 옵션 */
const PERIOD_TYPE_OPTIONS = [
  { value: 'PAYMENT_DATE', label: '결제일' },
  { value: 'ORDER_DATE', label: '주문일' },
  { value: 'USAGE_DATE', label: '이용일' },
];

/** 기간 프리셋 옵션 */
const PERIOD_PRESET_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: '7days', label: '최근 7일' },
  { value: '1month', label: '1개월' },
  { value: '2months', label: '2개월' },
  { value: '3months', label: '3개월' },
  { value: 'custom', label: '직접입력' },
];

/** 주문 상태 옵션 (숙박용) */
const ORDER_STATUS_OPTIONS = [
  { value: 'PAID', label: '결제완료' },
  { value: 'PENDING_RESERVATION', label: '예약대기' },
  { value: 'RESERVATION_CONFIRMED', label: '예약확정' },
  { value: 'COMPLETED', label: '이용완료' },
  { value: 'CANCEL_REQUESTED', label: '취소요청' },
  { value: 'CANCELLED', label: '취소완료' },
];

interface HotelOrderSearchParams {
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

export const Route = createFileRoute('/_auth/order/hotel/')({
  component: HotelOrderListPage,
  validateSearch: (search: Record<string, unknown>): HotelOrderSearchParams => {
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
  },
});

/** 주문 데이터 타입 (API 응답 기반) */
interface HotelOrder {
  id: number;
  orderNumber: string;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  productId: number;
  productName: string;
  campaignId: number;
  campaignName: string;
  influencerId: number;
  influencerName: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  hotelOptionName?: string | null;
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<HotelOrder>();

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

/** 상태별 액션 버튼 정보 */
const STATUS_ACTION_CONFIG: Partial<
  Record<OrderStatus, { label: string; nextStatus: OrderStatus }>
> = {
  PAID: { label: '주문확인', nextStatus: 'PENDING_RESERVATION' },
  PENDING_RESERVATION: {
    label: '예약확정',
    nextStatus: 'RESERVATION_CONFIRMED',
  },
};

function HotelOrderListPage() {
  const searchParams = Route.useSearch();
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

  const navigate = Route.useNavigate();

  // orderStatus를 기존 status 필터로 변환 (ALL 또는 특정 상태)
  const statusFilter: OrderStatusTab = (orderStatus as OrderStatusTab) || 'ALL';

  // 공통 필터 파라미터
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

  const trpcUtils = trpc.useUtils();
  const updateStatusMutation = trpc.backofficeOrder.updateStatus.useMutation({
    onSuccess: () => {
      trpcUtils.backofficeOrder.findAll.invalidate();
      trpcUtils.backofficeOrder.getStatusCounts.invalidate();
      toast.success('주문 상태가 변경되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '상태 변경에 실패했습니다.');
    },
  });

  /** 상태 변경 버튼 클릭 핸들러 */
  const handleStatusChange = async (
    order: HotelOrder,
    nextStatus: OrderStatus,
  ) => {
    const confirmed = await openConfirmModal({
      title: `${ORDER_STATUS_LABELS[nextStatus]} 상태로 변경됩니다.`,
    });

    if (confirmed) {
      updateStatusMutation.mutate({
        orderId: order.id,
        status: nextStatus,
      });
    }
  };

  /** 테이블 컬럼 정의 (컴포넌트 내부에서 핸들러 참조) */
  const columns = [
    columnHelper.accessor('orderNumber', {
      header: '주문번호',
      size: 100,
    }),
    columnHelper.accessor('status', {
      header: '주문상태',
      cell: (info) => ORDER_STATUS_LABELS[info.getValue()],
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
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const status = info.row.original.status;
        const actionConfig = STATUS_ACTION_CONFIG[status];

        if (!actionConfig) return null;

        return (
          <Button
            kind="neutral"
            variant="solid"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(info.row.original, actionConfig.nextStatus);
            }}
          >
            {actionConfig.label}
          </Button>
        );
      },
      size: 100,
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

  // TODO: 옵션 필터 API 구현 후 filterOptions에서 조회
  // 현재 API에서 지원하지 않으므로 빈 배열
  const optionOptions: { value: string; label: string }[] = [];

  // Convert comma-separated influencerIds to array
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
    navigate({ search: { ...searchParams, page: newPage } });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({ search: { ...searchParams, page: 1, limit: newLimit } });
  };

  const handleFiltersChange = (updates: Partial<OrderFiltersState>) => {
    const newSearchParams: Partial<HotelOrderSearchParams> = { page: 1 };

    if (updates.periodType !== undefined) {
      newSearchParams.periodType = updates.periodType;
    }
    if (updates.periodPreset !== undefined) {
      newSearchParams.periodPreset = updates.periodPreset;
    }
    if (updates.startDate !== undefined) {
      newSearchParams.startDate = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      newSearchParams.endDate = updates.endDate;
    }
    if (updates.orderStatus !== undefined) {
      newSearchParams.orderStatus = updates.orderStatus || '';
    }
    if (updates.campaignId !== undefined) {
      newSearchParams.campaignId = updates.campaignId || '';
    }
    if (updates.influencerIds !== undefined) {
      newSearchParams.influencerIds = updates.influencerIds.join(',');
    }
    if (updates.productId !== undefined) {
      newSearchParams.productId = updates.productId || '';
    }
    if (updates.optionId !== undefined) {
      newSearchParams.optionId = updates.optionId || '';
    }
    if (updates.searchQuery !== undefined) {
      newSearchParams.searchQuery = updates.searchQuery;
    }

    navigate({ search: { ...searchParams, ...newSearchParams } });
  };

  const handleExcelDownload = () => {
    toast.success('엑셀 다운로드가 시작되었습니다.');
  };

  const handleStatusTabChange = (tab: OrderStatusTab) => {
    navigate({
      search: {
        ...searchParams,
        page: 1,
        orderStatus: tab === 'ALL' ? '' : tab,
      },
    });
  };

  // 상태 탭 목록 생성 (숙박용)
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
    hasAlert: ALERT_STATUSES.includes(key) && statusCounts[key] > 0,
  }));

  const handleRowClick = (order: HotelOrder) => {
    navigate({
      to: '/order/hotel/$orderId',
      params: { orderId: String(order.id) },
    });
  };

  return (
    <MajorPageLayout title="숙박 주문관리">
      <ListPageLayout
        tabs={
          <StatusTabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onTabChange={handleStatusTabChange}
          />
        }
        filters={
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
          />
        }
        toolbar={
          <TableToolbar
            label="주문"
            totalCount={totalCount}
            pageSize={limit}
            onPageSizeChange={handlePageSizeChange}
          />
        }
        table={
          <Table columns={columns} data={orders} onRowClick={handleRowClick} />
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
