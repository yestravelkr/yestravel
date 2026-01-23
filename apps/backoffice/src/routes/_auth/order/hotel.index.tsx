/**
 * Hotel Order List Page - 숙박 주문 관리 페이지
 *
 * 숙박 주문 목록을 조회하고 관리하는 페이지입니다.
 * URL: /order/hotel?status=PAID&page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import tw from 'tailwind-styled-components';

import {
  type HotelOrder,
  type HotelOrderStatus,
  type OrderStatusTab,
  getFilteredOrders,
  getOrderStatusTabs,
} from './_mocks/hotelOrderMock';

import { MajorPageLayout } from '@/components/layout';
import {
  Pagination,
  StatusTabs,
  Table,
  TableToolbar,
} from '@/shared/components';

interface HotelOrderSearchParams {
  status: OrderStatusTab;
  page: number;
  limit: number;
}

export const Route = createFileRoute('/_auth/order/hotel/')({
  component: HotelOrderListPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): HotelOrderSearchParams => ({
    status: (search.status as OrderStatusTab) || 'ALL',
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 50,
  }),
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
  const { status, page, limit } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tabs = getOrderStatusTabs();

  const { orders, totalCount } = getFilteredOrders(status, page, limit);
  const totalPages = Math.ceil(totalCount / limit);

  const handleTabChange = (tab: OrderStatusTab) => {
    navigate({ search: { status: tab, page: 1, limit } });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { status, page: newPage, limit } });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({ search: { status, page: 1, limit: newLimit } });
  };

  return (
    <MajorPageLayout title="숙박 주문관리">
      <StatusTabs
        tabs={tabs}
        activeTab={status}
        onTabChange={handleTabChange}
      />

      {/* TODO: 필터 컴포넌트 추가 예정 */}

      <TableSection>
        <TableToolbar
          label="주문"
          totalCount={totalCount}
          pageSize={limit}
          onPageSizeChange={handlePageSizeChange}
        />
        <Table columns={columns} data={orders} />
      </TableSection>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </MajorPageLayout>
  );
}

const TableSection = tw.div`
  mt-4
`;

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
