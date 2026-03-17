/**
 * Influencer Hotel Order Detail Page - 인플루언서 파트너 숙박 주문 상세 페이지
 *
 * URL: /influencer/order/hotel/:orderId
 */

import { createFileRoute } from '@tanstack/react-router';

import { OrderDetailContent } from '@/components/order/OrderDetailContent';

export const Route = createFileRoute('/influencer/order/hotel/$orderId')({
  component: InfluencerHotelOrderDetailPage,
});

function InfluencerHotelOrderDetailPage() {
  const { orderId } = Route.useParams();

  return <OrderDetailContent orderId={orderId} />;
}
