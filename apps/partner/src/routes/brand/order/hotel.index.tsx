/**
 * Brand Hotel Order List Page - 브랜드 파트너 숙박 주문 목록 페이지
 *
 * URL: /brand/order/hotel?page=1&limit=50
 */

import { createFileRoute } from '@tanstack/react-router';

import {
  OrderListContent,
  validateHotelOrderSearch,
} from '@/components/order/OrderListContent';

export const Route = createFileRoute('/brand/order/hotel/')({
  component: BrandHotelOrderListPage,
  validateSearch: validateHotelOrderSearch,
});

function BrandHotelOrderListPage() {
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <OrderListContent
      basePath="/brand/order/hotel"
      searchParams={searchParams}
      onSearchParamsChange={(params) =>
        navigate({ search: { ...searchParams, ...params } })
      }
    />
  );
}
