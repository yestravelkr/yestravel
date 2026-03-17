/**
 * Influencer Hotel Order List Page - 인플루언서 파트너 숙박 주문 목록 페이지
 *
 * URL: /influencer/order/hotel?page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';

import {
  OrderListContent,
  validateHotelOrderSearch,
} from '@/components/order/OrderListContent';

export const Route = createFileRoute('/influencer/order/hotel/')({
  component: InfluencerHotelOrderListPage,
  validateSearch: validateHotelOrderSearch,
});

function InfluencerHotelOrderListPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <OrderListContent
      basePath="/influencer/order/hotel"
      searchParams={searchParams}
      onSearchParamsChange={(params) =>
        navigate({ search: { ...searchParams, ...params } })
      }
    />
  );
}
