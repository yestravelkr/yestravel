/**
 * Hotel Order List Page - 숙박 주문 관리 페이지
 *
 * 숙박 주문 목록을 조회하고 관리하는 페이지입니다.
 * URL: /order/hotel?page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import {
  OrderFilters,
  type OrderFiltersState,
} from './_components/OrderFilters';
import {
  CAMPAIGN_OPTIONS,
  type HotelOrder,
  type HotelOrderStatus,
  INFLUENCER_OPTIONS,
  OPTION_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderStatusTab,
  PERIOD_PRESET_OPTIONS,
  PERIOD_TYPE_OPTIONS,
  PRODUCT_OPTIONS,
  getFilteredOrders,
  getOrderStatusTabs,
} from './_mocks/hotelOrderMock';

import { MajorPageLayout } from '@/components/layout';
import {
  ListPageLayout,
  Pagination,
  StatusTabs,
  Table,
  TableToolbar,
} from '@/shared/components';

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

const STATUS_LABELS: Record<HotelOrderStatus, string> = {
  PENDING_PAYMENT: '결제대기',
  PAID: '결제완료',
  PENDING_BOOKING: '예약대기',
  BOOKING_CONFIRMED: '예약확정',
  CLAIM_REQUESTED: '클레임 요청',
  CLAIM_COMPLETED: '클레임 완료',
  COMPLETED: '이용완료',
};

const columnHelper = createColumnHelper<HotelOrder>();

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

const columns = [
  columnHelper.accessor('orderNumber', {
    header: '주문번호',
    size: 100,
  }),
  columnHelper.accessor('status', {
    header: '주문상태',
    cell: (info) => STATUS_LABELS[info.getValue()],
    size: 90,
  }),
  columnHelper.accessor('paidAt', {
    header: '결제일시',
    size: 120,
  }),
  columnHelper.accessor('campaignName', {
    header: '캠페인',
    size: 100,
  }),
  columnHelper.accessor('influencerName', {
    header: '인플루언서',
    size: 100,
  }),
  columnHelper.accessor('productName', {
    header: '상품',
    size: 120,
  }),
  columnHelper.accessor('optionName', {
    header: '옵션',
    size: 80,
  }),
  columnHelper.display({
    id: 'usageDate',
    header: '이용일',
    cell: (info) =>
      `${info.row.original.checkInDate} ~ ${info.row.original.checkOutDate}`,
    size: 140,
  }),
  columnHelper.accessor('paymentAmount', {
    header: '결제금액',
    cell: (info) => formatPrice(info.getValue()),
    size: 100,
  }),
  columnHelper.accessor('request', {
    header: '요청사항',
    cell: (info) => info.getValue() || '-',
    size: 120,
  }),
  columnHelper.accessor('buyerName', {
    header: '구매자',
    size: 80,
  }),
  columnHelper.accessor('buyerPhone', {
    header: '구매자 연락처',
    size: 130,
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: () => <ActionButton>상세보기</ActionButton>,
    size: 100,
  }),
];

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
    optionId,
    searchQuery,
  } = searchParams;

  const navigate = Route.useNavigate();

  // orderStatus를 기존 status 필터로 변환 (ALL 또는 특정 상태)
  const statusFilter: OrderStatusTab = (orderStatus as OrderStatusTab) || 'ALL';
  const { orders, totalCount } = getFilteredOrders(statusFilter, page, limit);
  const totalPages = Math.ceil(totalCount / limit);

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
    optionId: optionId || null,
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

  const statusTabs = getOrderStatusTabs();

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
            campaignOptions={CAMPAIGN_OPTIONS}
            influencerOptions={INFLUENCER_OPTIONS}
            productOptions={PRODUCT_OPTIONS}
            optionOptions={OPTION_OPTIONS}
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
        table={<Table columns={columns} data={orders} />}
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

const ActionButton = tw.button`
  px-3
  py-1.5
  text-sm
  text-blue-600
  hover:text-blue-800
  hover:bg-blue-50
  rounded
  transition-colors
`;
