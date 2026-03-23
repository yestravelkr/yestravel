/**
 * CancelRequestPage - 취소 요청 페이지
 *
 * 주문 취소를 요청하는 페이지입니다.
 *
 * Usage:
 * - /cancel-request/:orderNumber
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { ClaimReasonCategory } from '@yestravelkr/api-types';
import { X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { openConfirmModal } from '@/components/common/ConfirmModal';
import { trpc } from '@/shared';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/_auth/cancel-request/$orderNumber')({
  component: CancelRequestPage,
});

/** 취소 사유 옵션 */
const CANCEL_REASONS: { value: ClaimReasonCategory; label: string }[] = [
  { value: 'WRONG_ORDER', label: '상품을 잘못 주문함' },
  { value: 'CHANGE_OF_MIND', label: '단순 변심' },
  { value: 'OTHER', label: '직접 입력' },
];

// ============================================================================
// Skeleton Component
// ============================================================================

function CancelRequestSkeleton() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <CloseButton onClick={() => navigate({ to: '/my-orders' })}>
          <X size={24} />
        </CloseButton>
      </Header>
      <ContentWrapper>
        <Section>
          <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-3 mt-5">
            <div className="w-[52px] h-[52px] bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-[22px] w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </Section>
        <Section>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-col gap-3 mt-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-11 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </Section>
      </ContentWrapper>
    </Container>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function CancelRequestPage() {
  return (
    <Suspense fallback={<CancelRequestSkeleton />}>
      <CancelRequestContent />
    </Suspense>
  );
}

function CancelRequestContent() {
  const navigate = useNavigate();
  const { orderNumber } = Route.useParams();

  const [selectedReason, setSelectedReason] =
    useState<ClaimReasonCategory | null>(null);
  const [reasonDetail, setReasonDetail] = useState('');

  // 주문 상세 조회
  const [orderDetail] = trpc.shopOrder.getOrderDetail.useSuspenseQuery({
    orderNumber,
  });

  // 취소 수수료 미리보기 조회
  const [cancelFeePreview] =
    trpc.shopClaim.getCancelFeePreview.useSuspenseQuery({
      orderId: orderDetail.orderId,
    });

  const createClaimMutation = trpc.shopClaim.create.useMutation({
    onSuccess: () => {
      toast.success('취소 요청이 접수되었습니다.');
      navigate({ to: '/my-orders' });
    },
    onError: error => {
      toast.error(error.message || '취소 요청에 실패했습니다.');
    },
  });

  const handleClose = () => {
    navigate({ to: '/my-orders' });
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('취소 사유를 선택해주세요.');
      return;
    }

    const confirmed = await openConfirmModal({
      title: '취소 요청',
      description: '선택한 상품의 취소를 요청합니다.',
      confirmText: '취소 요청',
      cancelText: '취소',
    });

    if (!confirmed) {
      return;
    }

    const reasonText =
      selectedReason === 'OTHER'
        ? reasonDetail
        : (CANCEL_REASONS.find(r => r.value === selectedReason)?.label ?? '');

    await createClaimMutation.mutateAsync({
      orderId: orderDetail.orderId,
      type: 'CANCEL',
      reason: reasonText,
      claimOptionItems: [
        {
          optionId: orderDetail.accommodation.hotelOptionId,
          optionName: orderDetail.accommodation.optionName,
          quantity: 1,
          unitPrice: orderDetail.payment.productAmount,
        },
      ],
    });
  };

  const isSameDayCancelBlocked = cancelFeePreview.isSameDayCancelBlocked;

  const isSubmitDisabled =
    !selectedReason ||
    (selectedReason === 'OTHER' && !reasonDetail.trim()) ||
    createClaimMutation.isPending ||
    isSameDayCancelBlocked;

  // 환불 금액 계산
  const productAmount = cancelFeePreview.totalAmount;
  const cancelFee = cancelFeePreview.cancelFee;
  const refundAmount = cancelFeePreview.refundAmount;
  const feePercentage = cancelFeePreview.feePercentage;

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
        {/* 취소 요청 + 상품 정보 */}
        <Section>
          <PageTitle>취소 요청</PageTitle>
          <ProductCard>
            <ProductThumbnail
              src={orderDetail.accommodation.thumbnail || '/placeholder.png'}
              alt={orderDetail.accommodation.hotelName}
            />
            <ProductInfo>
              <ProductName>{orderDetail.accommodation.hotelName}</ProductName>
              <ProductOption>
                {orderDetail.accommodation.roomName}
              </ProductOption>
              <ProductPackage>
                {orderDetail.accommodation.optionName}
              </ProductPackage>
            </ProductInfo>
          </ProductCard>
        </Section>

        {/* 취소 사유 */}
        <Section>
          <SectionTitle>취소사유</SectionTitle>
          <ReasonList>
            {CANCEL_REASONS.map(reason => (
              <ReasonItem
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
              >
                <RadioCircle $selected={selectedReason === reason.value}>
                  {selectedReason === reason.value && <RadioDot />}
                </RadioCircle>
                <ReasonLabel>{reason.label}</ReasonLabel>
              </ReasonItem>
            ))}
          </ReasonList>

          {/* 직접 입력 선택 시 텍스트 입력 */}
          {selectedReason === 'OTHER' && (
            <TextArea
              placeholder="취소 사유를 입력해주세요"
              value={reasonDetail}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReasonDetail(e.target.value)
              }
              rows={3}
            />
          )}
        </Section>

        {/* 당일 취소 차단 안내 */}
        {isSameDayCancelBlocked && (
          <Section>
            <BlockedNotice>
              체크인 당일에는 취소할 수 없습니다. 고객센터에 문의해주세요.
            </BlockedNotice>
          </Section>
        )}

        {/* 환불 예정금액 */}
        <Section>
          <RefundHeader>
            <SectionTitle>환불 예정금액</SectionTitle>
            <RefundAmount>{refundAmount.toLocaleString()}원</RefundAmount>
          </RefundHeader>
          <RefundDetails>
            <RefundRow>
              <RefundLabel>상품금액</RefundLabel>
              <RefundValue>{productAmount.toLocaleString()}원</RefundValue>
            </RefundRow>
            <RefundRow>
              <RefundLabel>
                취소 수수료{cancelFee > 0 ? ` (${feePercentage}%)` : ''}
              </RefundLabel>
              <RefundValue>
                {cancelFee > 0 ? `-${cancelFee.toLocaleString()}원` : '0원'}
              </RefundValue>
            </RefundRow>
            <RefundRow>
              <RefundLabel>환불방법</RefundLabel>
              <RefundValue>{orderDetail.payment.paymentMethod}</RefundValue>
            </RefundRow>
          </RefundDetails>
        </Section>
      </ContentWrapper>

      {/* 하단 버튼 */}
      <Footer>
        <SubmitButton onClick={handleSubmit} disabled={isSubmitDisabled}>
          {createClaimMutation.isPending ? '처리 중...' : '취소 요청'}
        </SubmitButton>
      </Footer>
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
  flex flex-col
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
  w-6 h-6
  flex items-center justify-center
  text-fg-neutral
`;

const ContentWrapper = tw.div`
  bg-bg-layer-base
  flex flex-col gap-2
  flex-1
`;

const Section = tw.section`
  bg-white
  px-5 py-5
  flex flex-col gap-5
`;

const PageTitle = tw.h1`
  text-[21px] font-bold leading-7
  text-fg-neutral
`;

const SectionTitle = tw.h2`
  text-lg font-bold leading-6
  text-fg-neutral
`;

const ProductCard = tw.div`
  flex gap-3
`;

const ProductThumbnail = tw.img`
  w-[52px] h-[52px]
  rounded-xl
  object-cover
  border border-black/5
  flex-shrink-0
`;

const ProductInfo = tw.div`
  flex flex-col gap-1
  min-w-0
`;

const ProductName = tw.p`
  text-[16.5px] font-medium leading-[22px]
  text-fg-neutral
  truncate
`;

const ProductOption = tw.p`
  text-[15px] leading-5
  text-fg-neutral
`;

const ProductPackage = tw.p`
  text-[15px] leading-5
  text-fg-muted
`;

const ReasonList = tw.div`
  flex flex-col
`;

const ReasonItem = tw.button`
  flex items-center gap-2
  h-11
  text-left
`;

const RadioCircle = tw.div<{ $selected?: boolean }>`
  w-[22px] h-[22px]
  rounded-full
  border-2
  flex items-center justify-center
  flex-shrink-0
  transition-colors
  ${({ $selected }) => ($selected ? 'border-[#449AFC]' : 'border-gray-300')}
`;

const RadioDot = tw.div`
  w-3 h-3
  rounded-full
  bg-[#449AFC]
`;

const ReasonLabel = tw.span`
  text-[16.5px] leading-[22px]
  text-fg-neutral
`;

const TextArea = tw.textarea`
  w-full
  px-4 py-3
  border border-stroke-neutral
  rounded-xl
  text-base
  resize-none
  placeholder:text-fg-muted
  focus:outline-none focus:border-primary
`;

const RefundHeader = tw.div`
  flex items-center justify-between
`;

const RefundAmount = tw.span`
  text-lg font-bold leading-6
  text-[#EB3D3D]
`;

const RefundDetails = tw.div`
  flex flex-col gap-2
`;

const RefundRow = tw.div`
  flex items-center gap-1
`;

const RefundLabel = tw.span`
  text-[15px] leading-5
  text-fg-muted
`;

const RefundValue = tw.span`
  flex-1
  text-[15px] leading-5
  text-fg-muted
  text-right
`;

const Footer = tw.footer`
  p-5
  bg-white
`;

const BlockedNotice = tw.p`
  text-[15px] leading-5
  text-[#EB3D3D] font-medium
`;

const SubmitButton = tw.button`
  w-full
  h-[52px]
  bg-fg-neutral text-white
  rounded-xl
  font-medium text-[16.5px]
  disabled:bg-bg-disabled disabled:text-fg-disabled disabled:cursor-not-allowed
`;
