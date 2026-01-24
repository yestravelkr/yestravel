/**
 * Hotel Order Detail Page - 숙박 주문 상세 페이지
 *
 * 개별 주문의 상세 정보를 조회하고 관리하는 페이지
 * URL: /order/hotel/:orderId
 */

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { MemberInfoCard } from './_components/MemberInfoCard';
import { OrderDetailHeader } from './_components/OrderDetailHeader';
import { OrderStatusCard } from './_components/OrderStatusCard';
import { PaymentInfoCard } from './_components/PaymentInfoCard';
import {
  getOrderDetail,
  getOrderDetailTabs,
  type HotelOrderStatus,
} from './_mocks/hotelOrderMock';

import { DetailPageLayout } from '@/shared/components';

export const Route = createFileRoute('/_auth/order/hotel/$orderId')({
  component: HotelOrderDetailPage,
});

function HotelOrderDetailPage() {
  const { orderId } = Route.useParams();
  const orderDetail = getOrderDetail(orderId);

  const [activeTab, setActiveTab] = useState<'ALL' | HotelOrderStatus>('ALL');

  if (!orderDetail) {
    return (
      <PageContainer>
        <NotFoundMessage>주문을 찾을 수 없습니다.</NotFoundMessage>
      </PageContainer>
    );
  }

  const tabs = getOrderDetailTabs(orderDetail.status);

  const handleConfirm = () => {
    toast.success('예약이 확정되었습니다.');
  };

  const handleManage = () => {
    toast.info('주문관리 메뉴가 열립니다.');
  };

  const handleHistory = () => {
    toast.info('주문 히스토리를 확인합니다.');
  };

  return (
    <PageContainer>
      <OrderDetailHeader
        orderNumber={orderDetail.orderNumber}
        campaignName={orderDetail.campaignName}
        influencerName={orderDetail.influencerName}
        orderedAt={orderDetail.orderedAt}
      />

      <DetailPageLayout
        main={
          <OrderStatusCard
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            statusLabel={orderDetail.statusLabel}
            statusDate={orderDetail.statusDate}
            itemCount={orderDetail.items.length}
            items={orderDetail.items}
            onConfirm={handleConfirm}
            onManage={handleManage}
            onHistory={handleHistory}
          />
        }
        side={
          <>
            <PaymentInfoCard payment={orderDetail.payment} />
            <MemberInfoCard member={orderDetail.member} />
          </>
        }
      />
    </PageContainer>
  );
}

const PageContainer = tw.div`
  flex
  flex-col
  gap-8
  p-6
  min-h-full
  bg-[var(--bg-layer-base)]
`;

const NotFoundMessage = tw.div`
  text-[var(--fg-muted)]
  text-lg
`;
