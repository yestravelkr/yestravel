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

  const rejectClaimMutation = trpc.backofficeClaim.reject.useMutation({
    onSuccess: () => {
      toast.success('취소요청이 거절되었습니다.');
      utils.backofficeOrder.findById.invalidate({ id: Number(orderId) });
    },
    onError: (error) => {
      toast.error(error.message || '취소 거절에 실패했습니다.');
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

  const handleConfirm = () => {
    toast.success('예약이 확정되었습니다.');
  };

  const handleManage = () => {
    toast.info('주문관리 메뉴가 열립니다.');
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
      refundAmount: result.refundAmount,
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
            status={orderDetail.status}
            statusLabel={orderDetail.statusLabel}
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
            cancelReason={orderDetail.cancelReason}
            onConfirm={handleConfirm}
            onManage={handleManage}
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
