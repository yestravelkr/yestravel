/**
 * OrderDetailContent - 숙박 주문 상세 공통 컴포넌트
 *
 * Brand/Influencer 주문 상세 페이지에서 공유하는 컴포넌트입니다.
 * admin-shared의 컴포넌트를 사용하며, PARTNER_CAPABILITIES로 액션을 제한합니다.
 */

import {
  OrderDetailHeader,
  OrderStatusCard,
  PaymentInfoCard,
  MemberInfoCard,
  PARTNER_CAPABILITIES,
  openOrderHistoryModal,
  type OrderHistoryItemData,
  useAdminTrpc,
} from '@yestravelkr/admin-shared';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

interface OrderDetailContentProps {
  /** 주문 ID */
  orderId: string;
}

/**
 * Usage:
 * <OrderDetailContent orderId="123" />
 */
export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
  const trpc = useAdminTrpc();
  const utils = trpc.useUtils();

  const {
    data: orderDetail,
    isLoading,
    isError,
  } = trpc.backofficeOrder.findById.useQuery({
    id: Number(orderId),
  });

  const { data: claims } = trpc.backofficeClaim.findByOrderId.useQuery(
    { orderId: Number(orderId) },
    { enabled: !!orderDetail },
  );

  const activeClaim = claims?.find((c) => c.status === 'REQUESTED') ?? null;
  const claimData = activeClaim ?? claims?.[0] ?? null;

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

  const cancelReason = claimData?.reason ?? null;

  const displayStatus =
    claimData?.status === 'REQUESTED'
      ? claimData.type === 'CANCEL'
        ? 'CANCEL_REQUESTED'
        : 'RETURN_REQUESTED'
      : orderDetail.status;

  const displayStatusLabel =
    displayStatus === 'CANCEL_REQUESTED'
      ? '취소요청'
      : displayStatus === 'RETURN_REQUESTED'
        ? '반품요청'
        : orderDetail.statusLabel;

  const handleHistory = async () => {
    try {
      const histories = await utils.backofficeOrder.getHistory.fetch({
        orderId: Number(orderId),
      });

      const options = orderDetail.items.map((item) => ({
        id: item.id,
        name: item.optionName,
      }));

      const historyItems: OrderHistoryItemData[] = histories.map((h) => ({
        id: h.id,
        description: h.description ?? null,
        optionId: h.optionId ?? null,
        optionName: h.optionName ?? null,
        createdAt: h.createdAt,
      }));

      await openOrderHistoryModal({
        histories: historyItems,
        options,
      });
    } catch {
      toast.error('주문 히스토리를 불러오는데 실패했습니다.');
    }
  };

  return (
    <PageContainer>
      <OrderDetailHeader
        orderNumber={orderDetail.orderNumber}
        campaignName={orderDetail.campaignName}
        influencerName={orderDetail.influencerName}
        orderedAt={dayjs(orderDetail.orderedAt).format('YY.MM.DD HH:mm')}
      />

      <ContentLayout>
        <MainSection>
          <OrderStatusCard
            status={displayStatus}
            statusLabel={displayStatusLabel}
            statusDate={
              orderDetail.statusDate
                ? dayjs(orderDetail.statusDate).format('YY.MM.DD HH:mm')
                : '-'
            }
            items={orderDetail.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              optionName: item.optionName,
              checkInDate: item.checkInDate ?? '-',
              checkOutDate: item.checkOutDate ?? '-',
              amount: item.amount,
            }))}
            cancelReason={cancelReason}
            onHistory={handleHistory}
            capabilities={PARTNER_CAPABILITIES}
          />
        </MainSection>
        <SideSection>
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
        </SideSection>
      </ContentLayout>
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

const ContentLayout = tw.div`
  flex
  gap-6
`;

const MainSection = tw.div`
  flex-1
  min-w-0
`;

const SideSection = tw.div`
  w-[320px]
  shrink-0
  flex
  flex-col
  gap-6
`;
