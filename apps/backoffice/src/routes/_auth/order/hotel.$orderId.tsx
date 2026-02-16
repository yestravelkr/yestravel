/**
 * Hotel Order Detail Page - 숙박 주문 상세 페이지
 *
 * 개별 주문의 상세 정보를 조회하고 관리하는 페이지
 * URL: /order/hotel/:orderId
 */

import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { MemberInfoCard } from './_components/MemberInfoCard';
import { OrderDetailHeader } from './_components/OrderDetailHeader';
import { OrderStatusCard } from './_components/OrderStatusCard';
import { PaymentInfoCard } from './_components/PaymentInfoCard';

import {
  DetailPageLayout,
  openCancelApproveModal,
  openCancelOrderModal,
  openConfirmModal,
} from '@/shared/components';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/order/hotel/$orderId')({
  component: HotelOrderDetailPage,
});

function HotelOrderDetailPage() {
  const { orderId } = Route.useParams();
  const utils = trpc.useUtils();

  const {
    data: orderDetail,
    isLoading,
    isError,
  } = trpc.backofficeOrder.findById.useQuery({
    id: Number(orderId),
  });

  // 클레임 이력 조회 (취소 사유 표시용)
  // Order.status와 별개로 REQUESTED 클레임이 있을 수 있으므로 항상 조회
  const { data: claims } = trpc.backofficeClaim.findByOrderId.useQuery(
    { orderId: Number(orderId) },
    { enabled: !!orderDetail },
  );

  // 가장 최근 REQUESTED 클레임 (승인/거절 대상)
  const activeClaim = claims?.find((c) => c.status === 'REQUESTED') ?? null;
  // 표시용: 활성 클레임 우선, 없으면 가장 최근 클레임
  const claimData = activeClaim ?? claims?.[0] ?? null;

  const updateStatusMutation = trpc.backofficeOrder.updateStatus.useMutation({
    onSuccess: (data) => {
      const messages: Record<string, string> = {
        PENDING_RESERVATION: '주문이 확인되었습니다.',
        RESERVATION_CONFIRMED: '예약이 확정되었습니다.',
      };
      toast.success(messages[data.newStatus] ?? '상태가 변경되었습니다.');
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message || '상태 변경에 실패했습니다.');
    },
  });

  const approveClaimMutation = trpc.backofficeClaim.approve.useMutation({
    onSuccess: (data) => {
      toast.success(
        `취소가 승인되었습니다. (환불금액: ${data.refundAmount.toLocaleString()}원)`,
      );
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message || '취소 승인에 실패했습니다.');
    },
  });

  const revertStatusMutation = trpc.backofficeOrder.revertStatus.useMutation({
    onSuccess: () => {
      toast.success('상태가 변경되었습니다.');
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectClaimMutation = trpc.backofficeClaim.reject.useMutation({
    onSuccess: () => {
      toast.success('취소요청이 거절되었습니다.');
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message || '취소 거절에 실패했습니다.');
    },
  });

  const cancelOrderMutation = trpc.backofficeOrder.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success('주문이 취소되었습니다.');
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message || '주문 취소에 실패했습니다.');
    },
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

  const handleConfirm = async () => {
    const isPaid = displayStatus === 'PAID';
    const confirmed = await openConfirmModal({
      title: isPaid ? '주문을 확인하시겠습니까?' : '예약을 확정하시겠습니까?',
      description: isPaid
        ? '예약대기 상태로 변경됩니다.'
        : '예약확정 상태로 변경됩니다.',
    });

    if (!confirmed) return;

    updateStatusMutation.mutate({
      orderId: Number(orderId),
      status: isPaid ? 'PENDING_RESERVATION' : 'RESERVATION_CONFIRMED',
    });
  };

  const handleRevertStatus = async () => {
    const revertLabelMap: Record<string, string> = {
      PENDING_RESERVATION: '결제 완료',
      RESERVATION_CONFIRMED: '예약 대기',
    };
    const targetLabel = revertLabelMap[displayStatus];
    if (!targetLabel) return;

    const confirmed = await openConfirmModal({
      title: `${targetLabel} 상태로 변경하시겠습니까?`,
      description: '주문 상태가 이전 단계로 되돌아갑니다.',
    });

    if (!confirmed) return;

    revertStatusMutation.mutate({
      orderId: Number(orderId),
    });
  };

  const handleCancelOrder = async () => {
    const result = await openCancelOrderModal({
      productAmount: orderDetail.payment.totalAmount,
      defaultCancelFee: 0,
    });

    if (!result?.confirmed) return;

    cancelOrderMutation.mutate({
      orderId: Number(orderId),
      // TODO: 취소 사유 저장 구조 확정 후 연동 (Order 필드 or Claim)
      reason: result.reason || '어드민 직접 취소',
      refundAmount: result.refundAmount,
    });
  };

  const handleHistory = () => {
    toast.info('주문 히스토리를 확인합니다.');
  };

  const handleCancelApprove = async () => {
    const result = await openCancelApproveModal({
      productAmount: orderDetail.payment.totalAmount,
      defaultCancelFee: 0,
    });

    if (!result?.confirmed) return;

    approveClaimMutation.mutate({
      orderId: Number(orderId),
      cancelFee: result.cancelFee,
    });
  };

  const handleCancelReject = async () => {
    const confirmed = await openConfirmModal({
      title: '취소요청을 거절합니다.',
      description: '이전 주문상태로 변경됩니다.',
    });

    if (!confirmed) return;

    rejectClaimMutation.mutate({ orderId: Number(orderId) });
  };

  // 클레임 데이터에서 취소 사유 표시
  const cancelReason = claimData?.reason ?? null;

  // displayStatus: Order.status + Claim.status 합성
  // REQUESTED 클레임이 있으면 CANCEL_REQUESTED / RETURN_REQUESTED
  const displayStatus =
    claimData?.status === 'REQUESTED'
      ? claimData.type === 'CANCEL'
        ? 'CANCEL_REQUESTED'
        : 'RETURN_REQUESTED'
      : orderDetail.status;

  // displayStatusLabel: displayStatus에 따른 라벨
  const displayStatusLabel =
    displayStatus === 'CANCEL_REQUESTED'
      ? '취소요청'
      : displayStatus === 'RETURN_REQUESTED'
        ? '반품요청'
        : orderDetail.statusLabel;

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
            onConfirm={handleConfirm}
            onRevertStatus={handleRevertStatus}
            onCancelOrder={handleCancelOrder}
            onHistory={handleHistory}
            onCancelApprove={handleCancelApprove}
            onCancelReject={handleCancelReject}
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
