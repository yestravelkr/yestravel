/**
 * MyOrdersPage - 주문내역 페이지
 *
 * 로그인한 사용자의 주문내역을 표시하는 페이지입니다.
 *
 * Usage:
 * - /my-orders
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ChevronLeft, FileText, LogOut } from 'lucide-react';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { openLoginBottomSheet } from '@/components/auth/LoginBottomSheet';
import {
  OrderStatusCard,
  HotelOrderCardContent,
  DeliveryOrderCardContent,
  type OrderStatusType,
} from '@/components/order';
import { trpc } from '@/shared';
import { HeaderLayout } from '@/shared/components/HeaderLayout';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/my-orders')({
  component: MyOrdersPage,
});

/**
 * 주문 취소 가능 여부 확인
 */
function canCancelOrder(status: string): boolean {
  const cancelableStatuses = [
    'PENDING_PAYMENT',
    'PAYMENT_COMPLETED',
    'PENDING_RESERVATION',
    'RESERVATION_CONFIRMED',
  ];
  return cancelableStatuses.includes(status);
}

function MyOrdersPage() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <LoginRequiredView />;
  }

  return (
    <Suspense fallback={<MyOrdersSkeleton />}>
      <MyOrdersContent />
    </Suspense>
  );
}

/**
 * 로그인 필요 화면
 */
function LoginRequiredView() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleLogin = async () => {
    const result = await openLoginBottomSheet();
    if (result?.success) {
      window.location.reload();
    }
  };

  return (
    <HeaderLayout
      title="주문내역"
      left={
        <BackButton onClick={handleBack}>
          <ArrowLeft size={24} />
        </BackButton>
      }
    >
      <EmptyContainer>
        <EmptyText>로그인이 필요한 서비스입니다.</EmptyText>
        <LoginButton onClick={handleLogin}>로그인</LoginButton>
      </EmptyContainer>
    </HeaderLayout>
  );
}

/**
 * 주문내역 콘텐츠
 */
function MyOrdersContent() {
  const navigate = useNavigate();
  const [data] = trpc.shopOrder.getMyOrders.useSuspenseQuery({});

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleOrderClick = (orderNumber: string) => {
    navigate({ to: '/order/$orderNumber', params: { orderNumber } });
  };

  const handleProductClick = (saleId: number) => {
    navigate({ to: '/sale/$saleId', params: { saleId: String(saleId) } });
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate({ to: '/' });
  };

  return (
    <HeaderLayout
      title="주문내역"
      left={
        <BackButton onClick={handleBack}>
          <ArrowLeft size={24} />
        </BackButton>
      }
      right={
        <LogoutButton onClick={handleLogout}>
          <LogOut size={20} />
        </LogoutButton>
      }
    >
      <ContentWrapper>
        {data.orders.length === 0 ? (
          <EmptyContainer>
            <EmptyIcon>
              <FileText size={60} />
            </EmptyIcon>
            <EmptyText>주문내역이 없어요</EmptyText>
          </EmptyContainer>
        ) : (
          <OrderList>
            {data.orders.map(order => (
              <OrderSection key={order.orderId}>
                <OrderDateHeader
                  onClick={() => handleOrderClick(order.orderNumber)}
                >
                  <OrderDate>{order.orderDate}</OrderDate>
                  <OrderDetailLink>
                    <span>주문상세</span>
                    <ChevronLeft size={20} className="rotate-180" />
                  </OrderDetailLink>
                </OrderDateHeader>
                <OrderCard>
                  <OrderStatusCard>
                    <OrderStatusCard.Header
                      status={order.status as OrderStatusType}
                    >
                      {order.statusDescription}
                    </OrderStatusCard.Header>
                    {order.type === 'HOTEL' ? (
                      <HotelOrderCardContent
                        order={order}
                        onProductClick={handleProductClick}
                      />
                    ) : (
                      <DeliveryOrderCardContent
                        order={order}
                        onProductClick={handleProductClick}
                      />
                    )}
                    {canCancelOrder(order.status) && (
                      <OrderStatusCard.Actions>
                        <OrderStatusCard.SubtleButton>
                          취소 요청
                        </OrderStatusCard.SubtleButton>
                      </OrderStatusCard.Actions>
                    )}
                  </OrderStatusCard>
                </OrderCard>
              </OrderSection>
            ))}
          </OrderList>
        )}
      </ContentWrapper>
    </HeaderLayout>
  );
}

/**
 * 스켈레톤 로딩
 */
function MyOrdersSkeleton() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <HeaderLayout
      title="주문내역"
      left={
        <BackButton onClick={handleBack}>
          <ArrowLeft size={24} />
        </BackButton>
      }
    >
      <ContentWrapper>
        <OrderList>
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i}>
              <SkeletonRow>
                <SkeletonThumbnail />
                <SkeletonInfo>
                  <SkeletonLine $width="60%" />
                  <SkeletonLine $width="80%" />
                  <SkeletonLine $width="40%" />
                </SkeletonInfo>
              </SkeletonRow>
            </SkeletonCard>
          ))}
        </OrderList>
      </ContentWrapper>
    </HeaderLayout>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const BackButton = tw.button`
  w-6 h-6
  flex items-center justify-center
  text-fg-neutral
`;

const LogoutButton = tw.button`
  w-9 h-9
  flex items-center justify-center
  border border-stroke-neutral
  rounded-xl
  text-fg-neutral
`;

const ContentWrapper = tw.div`
  bg-bg-layer-base
  min-h-[calc(100vh-64px)]
`;

const OrderList = tw.div`
  flex flex-col gap-2
`;

const OrderSection = tw.div`
  bg-white
  px-5 py-8
  flex flex-col gap-3
`;

const OrderDateHeader = tw.div`
  flex items-center justify-between
  cursor-pointer
`;

const OrderDate = tw.span`
  text-lg font-bold
  text-fg-neutral
`;

const OrderDetailLink = tw.div`
  flex items-center gap-1
  text-[15px] text-fg-neutral
`;

const OrderCard = tw.div`
  border border-stroke-neutral
  rounded-xl
  overflow-hidden
`;

const EmptyContainer = tw.div`
  flex flex-col items-center
  py-8 gap-5
`;

const EmptyIcon = tw.div`
  w-[60px] h-[60px]
  flex items-center justify-center
  text-[#9e9e9e]
`;

const EmptyText = tw.p`
  text-fg-muted text-lg font-bold
  text-center
`;

const LoginButton = tw.button`
  px-6 py-3
  bg-primary text-white
  rounded-xl
  font-semibold
`;

// Skeleton Styles
const SkeletonCard = tw.div`
  bg-white
  rounded-xl
  p-4
`;

const SkeletonRow = tw.div`
  flex gap-3
`;

const SkeletonThumbnail = tw.div`
  w-20 h-20
  rounded-lg
  bg-gray-200
  animate-pulse
  flex-shrink-0
`;

const SkeletonInfo = tw.div`
  flex flex-col gap-2
  flex-1
`;

const SkeletonLine = tw.div<{ $width?: string }>`
  h-4
  bg-gray-200
  rounded
  animate-pulse
  ${({ $width }) => $width && `width: ${$width};`}
`;
