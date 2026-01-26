/**
 * OrderDetailPage - 주문 상세 페이지
 *
 * 주문 상세 정보를 표시하는 페이지입니다.
 * 현재 숙박(accommodation) 타입만 지원합니다.
 *
 * Usage:
 * - /order/{orderNumber} (주문 상세)
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Suspense } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import {
  ORDER_STATUS,
  AccommodationOrderStatusCard,
  UserInfoSection,
  PaymentSummarySection,
} from '@/components/order';
import { trpc } from '@/shared';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/order/$orderNumber')({
  component: OrderDetailPage,
});

// ============================================================================
// Skeleton Component
// ============================================================================

function OrderDetailSkeleton() {
  return (
    <Container>
      <Header>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </Header>
      <ContentWrapper>
        <Section>
          <div className="flex flex-col gap-1">
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-[18px] w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </Section>
        <Section>
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </Section>
        <Section>
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
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

function OrderDetailPage() {
  const { orderNumber } = Route.useParams();

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent orderNumber={orderNumber} />
    </Suspense>
  );
}

function OrderDetailContent({ orderNumber }: { orderNumber: string }) {
  const navigate = useNavigate();
  const [data] = trpc.shopOrder.getOrderDetail.useSuspenseQuery({
    orderNumber,
  });

  const handleClose = () => {
    navigate({ to: '/' });
  };

  const handleCancelRequest = () => {
    toast.success('취소 신청이 완료되었습니다.');
  };

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
        {/* Order Info */}
        <Section>
          <OrderInfoContainer>
            <OrderDate>{data.orderDate}</OrderDate>
            <OrderNumberText>주문번호: {data.orderNumber}</OrderNumberText>
          </OrderInfoContainer>
        </Section>

        {/* Order Status Card */}
        <AccommodationOrderStatusCard
          data={{
            status:
              data.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS],
            statusDescription: data.statusDescription ?? undefined,
            accommodation: {
              thumbnail: data.accommodation.thumbnail ?? null,
              hotelName: data.accommodation.hotelName,
              roomName: data.accommodation.roomName,
              optionName: data.accommodation.optionName,
            },
            checkIn: data.checkIn,
            checkOut: data.checkOut,
          }}
          onCancelRequest={handleCancelRequest}
        />

        {/* User Info */}
        <UserInfoSection user={data.user} />

        {/* Payment Summary */}
        <PaymentSummarySection payment={data.payment} type="accommodation" />
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

const OrderInfoContainer = tw.div`
  flex
  flex-col
  gap-1
`;

const OrderDate = tw.p`
  text-[21px]
  font-bold
  leading-7
  text-fg-neutral
`;

const OrderNumberText = tw.p`
  text-[13.5px]
  leading-[18px]
  text-fg-muted
`;
