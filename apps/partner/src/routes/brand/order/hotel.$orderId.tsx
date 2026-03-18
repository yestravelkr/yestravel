/**
 * Brand Hotel Order Detail Page - 브랜드 파트너 숙박 주문 상세 페이지
 *
 * URL: /brand/order/hotel/:orderId
 */

import { createFileRoute } from '@tanstack/react-router';

import { OrderDetailContent } from '@/components/order/OrderDetailContent';

export const Route = createFileRoute('/brand/order/hotel/$orderId')({
  component: BrandHotelOrderDetailPage,
});

function BrandHotelOrderDetailPage() {
  const { orderId } = Route.useParams();

  return <OrderDetailContent orderId={orderId} />;
}
