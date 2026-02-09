/**
 * CancelDetailPage - 취소 상세 페이지
 *
 * 취소/반품 요청 상세 정보를 표시하는 페이지입니다.
 *
 * Usage:
 * - /cancel-detail/{orderNumber}
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Suspense } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { openConfirmModal } from '@/components/common';
import { trpc } from '@/shared';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/_auth/cancel-detail/$orderNumber')({
  component: CancelDetailPage,
});

// ============================================================================
// Constants
// ============================================================================

/** 클레임 상태별 메시지 */
const CLAIM_STATUS_MESSAGE: Record<string, string> = {
  REQUESTED: '판매자 확인 후 취소 진행됩니다.',
  APPROVED: '취소가 승인되었습니다.',
  REJECTED: '취소 요청이 거절되었습니다.',
  COMPLETED: '취소가 완료되었습니다.',
  WITHDRAWN: '취소 요청이 철회되었습니다.',
};

/** 클레임 상태별 섹션 제목 */
const CLAIM_STATUS_TITLE: Record<string, string> = {
  REQUESTED: '취소요청',
  APPROVED: '취소승인',
  REJECTED: '취소거절',
  COMPLETED: '취소완료',
  WITHDRAWN: '취소철회',
};

// ============================================================================
// Skeleton Component
// ============================================================================

function CancelDetailSkeleton() {
  return (
    <Container>
      <Header>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </Header>
      <ContentWrapper>
        <Section>
          <div className="flex flex-col gap-1">
            <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-[18px] w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </Section>
        <Section>
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </Section>
        <Section>
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </Section>
      </ContentWrapper>
    </Container>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function CancelDetailPage() {
  const { orderNumber } = Route.useParams();

  return (
    <Suspense fallback={<CancelDetailSkeleton />}>
      <CancelDetailContent orderNumber={orderNumber} />
    </Suspense>
  );
}

function CancelDetailContent({ orderNumber }: { orderNumber: string }) {
  const navigate = useNavigate();

  // 주문 정보 조회
  const [orderData] = trpc.shopOrder.getOrderDetail.useSuspenseQuery({
    orderNumber,
  });

  // 클레임 정보 조회
  const [claimData] = trpc.shopClaim.findByOrderId.useSuspenseQuery({
    orderId: orderData.orderId,
  });

  // 취소 철회 mutation
  const utils = trpc.useUtils();
  const withdrawMutation = trpc.shopClaim.withdraw.useMutation({
    onSuccess: () => {
      toast.success('취소 요청이 철회되었습니다.');
      utils.shopClaim.findByOrderId.invalidate();
      utils.shopOrder.getOrderDetail.invalidate();
      navigate({ to: '/my-orders' });
    },
    onError: error => {
      toast.error(error.message || '취소 철회에 실패했습니다.');
    },
  });

  const handleClose = () => {
    navigate({ to: '/my-orders' });
  };

  const handleWithdraw = async () => {
    const confirmed = await openConfirmModal({
      title: '취소 철회',
      description: '취소 요청을 철회할까요?',
      confirmText: '취소 철회',
      cancelText: '취소',
    });

    if (confirmed) {
      withdrawMutation.mutate({ orderId: orderData.orderId });
    }
  };

  // 클레임이 없으면 에러
  if (!claimData) {
    return (
      <Container>
        <Header>
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </Header>
        <ContentWrapper>
          <Section>
            <p className="text-fg-muted">취소 요청 정보를 찾을 수 없습니다.</p>
          </Section>
        </ContentWrapper>
      </Container>
    );
  }

  const statusMessage =
    CLAIM_STATUS_MESSAGE[claimData.status] || '취소 요청 처리 중입니다.';
  const canWithdraw = claimData.status === 'REQUESTED';

  // 금액 계산
  const originalAmount = claimData.claimOptionItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const cancelFee = claimData.cancelFee;
  const refundAmount = originalAmount - cancelFee;

  return (
    <Container>
      {/* Header */}
      <Header>
        <CloseButton onClick={handleClose}>
          <X size={24} />
        </CloseButton>
      </Header>

      {/* Content */}
      <ContentWrapper>
        {/* Status Message */}
        <Section>
          <StatusContainer>
            <StatusTitle>{statusMessage}</StatusTitle>
            <StatusDate>
              {new Date(claimData.createdAt).toLocaleString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </StatusDate>
          </StatusContainer>
        </Section>

        {/* Cancel Request Info */}
        <Section>
          <SectionTitle>
            {CLAIM_STATUS_TITLE[claimData.status] || '취소요청'}
          </SectionTitle>

          {/* Product Info */}
          <ProductInfo>
            <ProductThumbnail>
              {orderData.accommodation.thumbnail ? (
                <img
                  src={orderData.accommodation.thumbnail}
                  alt={orderData.accommodation.hotelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </ProductThumbnail>
            <ProductDetails>
              <ProductName>{orderData.accommodation.hotelName}</ProductName>
              <ProductOption>{orderData.accommodation.roomName}</ProductOption>
              <ProductSubOption>
                {orderData.accommodation.optionName}
              </ProductSubOption>
            </ProductDetails>
          </ProductInfo>

          <Divider />

          {/* Check-in/out Info */}
          <CheckInfoRow>
            <CheckInfoColumn>
              <CheckLabel>체크인</CheckLabel>
              <CheckValue>{orderData.checkIn.date}</CheckValue>
              <CheckTime>{orderData.checkIn.time}</CheckTime>
            </CheckInfoColumn>
            <CheckInfoColumn>
              <CheckLabel>체크아웃</CheckLabel>
              <CheckValue>{orderData.checkOut.date}</CheckValue>
              <CheckTime>{orderData.checkOut.time}</CheckTime>
            </CheckInfoColumn>
          </CheckInfoRow>

          {/* Withdraw Button */}
          {canWithdraw && (
            <WithdrawButton
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? '처리 중...' : '취소 철회'}
            </WithdrawButton>
          )}
        </Section>

        {/* Refund Info */}
        <Section>
          <RefundHeader>
            <RefundLabel>환불 예정금액</RefundLabel>
            <RefundAmount>{refundAmount.toLocaleString()}원</RefundAmount>
          </RefundHeader>

          <RefundDetails>
            <RefundRow>
              <RefundRowLabel>상품금액</RefundRowLabel>
              <RefundRowValue>
                {originalAmount.toLocaleString()}원
              </RefundRowValue>
            </RefundRow>
            {cancelFee > 0 && (
              <RefundRow>
                <RefundRowLabel>취소 수수료</RefundRowLabel>
                <RefundRowValue>-{cancelFee.toLocaleString()}원</RefundRowValue>
              </RefundRow>
            )}
            <RefundRow>
              <RefundRowLabel>환불방법</RefundRowLabel>
              <RefundRowValue>
                {orderData.payment.paymentMethod || '결제수단'}
              </RefundRowValue>
            </RefundRow>
          </RefundDetails>
        </Section>
      </ContentWrapper>
    </Container>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const Container = tw.div`
  min-h-screen
  bg-bg-layer
  max-w-[600px]
  mx-auto
`;

const Header = tw.header`
  w-full
  h-16
  px-5
  py-5
  bg-white
  flex
  items-center
  gap-5
`;

const CloseButton = tw.button`
  w-6
  h-6
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const ContentWrapper = tw.div`
  bg-bg-layer-base
  flex
  flex-col
  gap-2
`;

const Section = tw.section`
  bg-white
  p-5
  flex
  flex-col
  gap-5
`;

// Status Section
const StatusContainer = tw.div`
  flex
  flex-col
  gap-1
`;

const StatusTitle = tw.p`
  text-[21px]
  font-bold
  leading-7
  text-fg-neutral
`;

const StatusDate = tw.p`
  text-[13.5px]
  leading-[18px]
  text-fg-muted
`;

// Section Title
const SectionTitle = tw.h2`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

// Product Info
const ProductInfo = tw.div`
  flex
  gap-3
`;

const ProductThumbnail = tw.div`
  w-[52px]
  h-[52px]
  rounded-xl
  overflow-hidden
  flex-shrink-0
  border
  border-black/5
`;

const ProductDetails = tw.div`
  flex
  flex-col
  gap-1
  flex-1
  min-w-0
`;

const ProductName = tw.p`
  text-[16.5px]
  font-medium
  leading-[22px]
  text-fg-neutral
  truncate
`;

const ProductOption = tw.p`
  text-[15px]
  leading-5
  text-fg-neutral
`;

const ProductSubOption = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const Divider = tw.div`
  h-px
  bg-stroke-neutral
`;

// Check-in/out Info
const CheckInfoRow = tw.div`
  flex
  gap-2
`;

const CheckInfoColumn = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const CheckLabel = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const CheckValue = tw.p`
  text-[16.5px]
  font-medium
  leading-[22px]
  text-fg-neutral
`;

const CheckTime = tw.p`
  text-[16.5px]
  font-medium
  leading-[22px]
  text-fg-neutral
`;

// Withdraw Button
const WithdrawButton = tw.button`
  w-full
  h-11
  bg-bg-neutral
  text-fg-neutral
  rounded-xl
  font-medium
  text-[16.5px]
  disabled:opacity-50
`;

// Refund Section
const RefundHeader = tw.div`
  flex
  justify-between
  items-center
`;

const RefundLabel = tw.p`
  text-lg
  font-bold
  leading-6
  text-fg-neutral
`;

const RefundAmount = tw.p`
  text-lg
  font-bold
  leading-6
  text-fg-critical
`;

const RefundDetails = tw.div`
  flex
  flex-col
  gap-2
`;

const RefundRow = tw.div`
  flex
  justify-between
  items-center
`;

const RefundRowLabel = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
`;

const RefundRowValue = tw.p`
  text-[15px]
  leading-5
  text-fg-muted
  text-right
`;
