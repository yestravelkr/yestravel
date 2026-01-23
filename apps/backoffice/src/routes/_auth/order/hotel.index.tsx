/**
 * Hotel Order List Page - 숙박 주문 관리 페이지
 *
 * 숙박 주문 목록을 조회하고 관리하는 페이지입니다.
 * URL: /order/hotel?status=PAID&page=1
 */

import { createFileRoute } from '@tanstack/react-router';

import {
  type OrderStatusTab,
  getOrderStatusTabs,
} from './_mocks/hotelOrderMock';

import { MajorPageLayout } from '@/components/layout';
import { Pagination, StatusTabs } from '@/shared/components';

interface HotelOrderSearchParams {
  status: OrderStatusTab;
  page: number;
}

export const Route = createFileRoute('/_auth/order/hotel/')({
  component: HotelOrderListPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): HotelOrderSearchParams => ({
    status: (search.status as OrderStatusTab) || 'ALL',
    page: Number(search.page) || 1,
  }),
});

function HotelOrderListPage() {
  const { status, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tabs = getOrderStatusTabs();

  const handleTabChange = (tab: OrderStatusTab) => {
    navigate({ search: { status: tab, page: 1 } });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { status, page: newPage } });
  };

  return (
    <MajorPageLayout title="숙박 주문관리">
      <StatusTabs
        tabs={tabs}
        activeTab={status}
        onTabChange={handleTabChange}
      />

      {/* TODO: 필터, 테이블 컴포넌트 추가 예정 */}

      <Pagination
        currentPage={page}
        totalPages={50}
        onPageChange={handlePageChange}
      />
    </MajorPageLayout>
  );
}
