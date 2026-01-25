/**
 * Hotel Order Detail Page - 숙박 주문 상세 페이지
 *
 * 개별 주문의 상세 정보를 조회하고 관리하는 페이지
 * URL: /order/hotel/:orderId
 */

import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { MemberInfoCard } from './_components/MemberInfoCard';
import { OrderDetailHeader } from './_components/OrderDetailHeader';
import { OrderStatusCard } from './_components/OrderStatusCard';
import { PaymentInfoCard } from './_components/PaymentInfoCard';

import { DetailPageLayout } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/order/hotel/$orderId')({
  component: HotelOrderDetailPage,
});

/** 주문 상태 타입 */
type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

/** 상태별 라벨 */
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  COMPLETED: '이용완료',
  CANCELLED: '취소',
  REFUNDED: '환불',
};

/** 알림 표시가 필요한 상태 */
const ALERT_STATUSES: OrderStatus[] = ['PAID', 'PENDING'];

function HotelOrderDetailPage() {
  const { orderId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');

  const {
    data: orderDetail,
    isLoading,
    isError,
  } = trpc.backofficeOrder.findById.useQuery({
    id: parseInt(orderId),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingMessage>로딩 중...</LoadingMessage>
      </PageContainer>
    );
  }

  if (isError || !orderDetail) {
    return (
      <PageContainer>
        <NotFoundMessage>주문을 찾을 수 없습니다.</NotFoundMessage>
      </PageContainer>
    );
  }

  const tabs = [
    {
      key: 'ALL' as const,
      label: '전체 주문',
    },
    {
      key: orderDetail.status as OrderStatus,
      label: ORDER_STATUS_LABELS[orderDetail.status as OrderStatus],
      count: 1,
      hasAlert: ALERT_STATUSES.includes(orderDetail.status as OrderStatus),
    },
  ];

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
        orderedAt={dayjs(orderDetail.orderedAt).format('YY.MM.DD HH:mm')}
      />

      <DetailPageLayout
        main={
          <OrderStatusCard
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            statusLabel={orderDetail.statusLabel}
            statusDate={
              orderDetail.statusDate
                ? dayjs(orderDetail.statusDate).format('YY.MM.DD HH:mm')
                : '-'
            }
            itemCount={orderDetail.items.length}
            items={orderDetail.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              optionName: item.optionName,
              checkInDate: item.checkInDate ?? '-',
              checkOutDate: item.checkOutDate ?? '-',
              amount: item.amount,
            }))}
            onConfirm={handleConfirm}
            onManage={handleManage}
            onHistory={handleHistory}
          />
        }
        side={
          <>
            <PaymentInfoCard
              payment={{
                paymentMethod: orderDetail.payment.paymentMethod,
                productAmount: orderDetail.payment.productAmount,
                refundAmount: orderDetail.payment.refundAmount,
                totalAmount: orderDetail.payment.totalAmount,
              }}
            />
            <MemberInfoCard
              member={{
                name: orderDetail.member.name,
                phone: orderDetail.member.phone,
              }}
            />
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

const LoadingMessage = tw.div`
  text-[var(--fg-muted)]
  text-lg
`;

const NotFoundMessage = tw.div`
  text-[var(--fg-muted)]
  text-lg
`;
