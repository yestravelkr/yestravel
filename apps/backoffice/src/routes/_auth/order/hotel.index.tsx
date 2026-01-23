/**
 * Hotel Order List Page - 숙박 주문 관리 페이지
 *
 * 숙박 주문 목록을 조회하고 관리하는 페이지입니다.
 * URL: /order/hotel?status=PAID
 */

import { createFileRoute } from '@tanstack/react-router';

import {
  type OrderStatusTab,
  getOrderStatusTabs,
} from './_mocks/hotelOrderMock';

import { MajorPageLayout } from '@/components/layout';
import { StatusTabs } from '@/shared/components';

interface HotelOrderSearchParams {
  status: OrderStatusTab;
}

export const Route = createFileRoute('/_auth/order/hotel/')({
  component: HotelOrderListPage,
  validateSearch: (
    search: Record<string, unknown>,
  ): HotelOrderSearchParams => ({
    status: (search.status as OrderStatusTab) || 'ALL',
  }),
});

function HotelOrderListPage() {
  const { status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tabs = getOrderStatusTabs();

  const handleTabChange = (tab: OrderStatusTab) => {
    navigate({ search: { status: tab } });
  };

  return (
    <MajorPageLayout title="숙박 주문관리">
      <StatusTabs
        tabs={tabs}
        activeTab={status}
        onTabChange={handleTabChange}
      />
    </MajorPageLayout>
  );
}
