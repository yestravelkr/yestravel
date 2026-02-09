/**
 * OrderCompletePage - 주문 완료 페이지
 *
 * 결제 완료 후 표시되는 주문 완료 페이지입니다.
 * 주문 상세 페이지와 컴포넌트를 공유합니다.
 *
 * Usage:
 * - /order-complete/{orderNumber} (결제 완료 후 이동)
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import {
  OrderStatusCard,
  UserInfoSection,
  PaymentSummarySection,
} from '@/components/order';
import { trpc } from '@/shared';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/_auth/order-complete/$orderNumber')({
  component: OrderCompletePage,
});

// ============================================================================
// Skeleton Component
// ============================================================================

function OrderCompleteSkeleton() {
  return (
    <Container>
      <Header>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </Header>
      <ContentWrapper>
        <Section>
          <div className="flex flex-col gap-1">
            <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-[18px] w-40 bg-gray-200 rounded animate-pulse" />
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

function OrderCompletePage() {
  const { orderNumber } = Route.useParams();

  return (
    <Suspense fallback={<OrderCompleteSkeleton />}>
      <OrderCompleteContent orderNumber={orderNumber} />
    </Suspense>
  );
}

function OrderCompleteContent({ orderNumber }: { orderNumber: string }) {
  const navigate = useNavigate();
  const [data] = trpc.shopOrder.getOrderDetail.useSuspenseQuery({
    orderNumber,
  });

  const handleClose = () => {
    if (data.influencerSlug) {
      navigate({ to: '/i/$slug', params: { slug: data.influencerSlug } });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleConfirm = () => {
    if (data.influencerSlug) {
      navigate({ to: '/i/$slug', params: { slug: data.influencerSlug } });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <IconButton onClick={handleClose}>
          <X size={24} />
        </IconButton>
      </Header>

      {/* Content */}
      <ContentWrapper>
        {/* Order Complete Title */}
        <Section>
          <OrderInfoContainer>
            <OrderCompleteTitle>주문완료</OrderCompleteTitle>
            <OrderNumberText>주문번호: {data.orderNumber}</OrderNumberText>
          </OrderInfoContainer>
        </Section>

        {/* Product Info Card */}
        <OrderStatusCard>
          <OrderStatusCard.AccommodationInfo
            thumbnail={data.accommodation.thumbnail ?? null}
            hotelName={data.accommodation.hotelName}
            roomName={data.accommodation.roomName}
            optionName={data.accommodation.optionName}
          />
          <OrderStatusCard.Divider />
          <OrderStatusCard.CheckTime
            checkIn={data.checkIn}
            checkOut={data.checkOut}
          />
        </OrderStatusCard>

        {/* User Info */}
        <UserInfoSection user={data.user} />

        {/* Payment Summary */}
        <PaymentSummarySection payment={data.payment} type="accommodation" />
      </ContentWrapper>

      {/* Footer Button */}
      <FooterContainer>
        <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
      </FooterContainer>
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
  flex
  flex-col
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

const IconButton = tw.button`
  w-6
  h-6
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const ContentWrapper = tw.div`
  flex-1
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

const OrderCompleteTitle = tw.h1`
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

const FooterContainer = tw.div`
  bg-white
  p-5
  pb-8
`;

const ConfirmButton = tw.button`
  w-full
  h-[52px]
  bg-bg-neutral-solid
  text-fg-on-surface
  rounded-xl
  flex
  items-center
  justify-center
  text-[16.5px]
  font-medium
  leading-[22px]
  hover:opacity-90
  transition-opacity
`;
