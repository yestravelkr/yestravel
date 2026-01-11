/**
 * OrderDetailPage - 주문 상세 페이지
 *
 * 주문 상세 정보를 표시하는 페이지입니다.
 * 숙박(accommodation)과 배송(shipping) 두 가지 타입을 지원합니다.
 * 주문 타입은 API 응답의 type 필드로 결정됩니다.
 *
 * Usage:
 * - /order/acc-123 (숙박 주문)
 * - /order/ship-456 (배송 주문)
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import {
  ORDER_STATUS,
  AccommodationOrderStatusCard,
  ShippingOrderStatusCard,
  CancelledProductsSection,
  UserInfoSection,
  ShippingInfoSection,
  PaymentSummarySection,
} from '@/components/order';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/order/$orderNumber')({
  component: OrderDetailPage,
});

// ============================================================================
// Types
// ============================================================================

interface AccommodationOrderData {
  type: 'accommodation';
  orderId: string;
  orderDate: string;
  orderNumber: string;
  status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
  statusDescription?: string;
  accommodation: {
    thumbnail: string | null;
    hotelName: string;
    roomName: string;
    optionName: string;
  };
  checkIn: {
    date: string;
    time: string;
  };
  checkOut: {
    date: string;
    time: string;
  };
  user: {
    name: string;
    phone: string;
  };
  payment: {
    totalAmount: number;
    productAmount: number;
    paymentMethod: string;
  };
}

interface ShippingOrderData {
  type: 'shipping';
  orderId: string;
  orderDate: string;
  orderNumber: string;
  status: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
  statusDescription?: string;
  products: Array<{
    id: string;
    thumbnail: string | null;
    name: string;
    option: string;
    price: number;
    quantity: number;
  }>;
  cancelledProducts?: Array<{
    id: string;
    thumbnail: string | null;
    name: string;
    option: string;
    price: number;
    quantity: number;
  }>;
  shipping: {
    recipientName: string;
    phone: string;
    address: string;
    request?: string;
  };
  payment: {
    totalAmount: number;
    productAmount: number;
    shippingFee: number;
    paymentMethod: string;
  };
}

type OrderData = AccommodationOrderData | ShippingOrderData;

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_ACCOMMODATION_ORDER: AccommodationOrderData = {
  type: 'accommodation',
  orderId: '123456',
  orderDate: '25.01.01 13:00',
  orderNumber: '123456',
  status: ORDER_STATUS.RESERVATION_CONFIRMED,
  accommodation: {
    thumbnail:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop',
    hotelName: '인천 월미도 고요하우스',
    roomName: '로얄 트윈',
    optionName: '3인 패키지',
  },
  checkIn: {
    date: '25.12.10(금)',
    time: '17:00',
  },
  checkOut: {
    date: '25.12.14(금)',
    time: '13:00',
  },
  user: {
    name: '김주민',
    phone: '010-0000-0000',
  },
  payment: {
    totalAmount: 13000,
    productAmount: 10000,
    paymentMethod: '카카오페이',
  },
};

const MOCK_SHIPPING_ORDER: ShippingOrderData = {
  type: 'shipping',
  orderId: '789012',
  orderDate: '25.01.01 13:00',
  orderNumber: '789012',
  status: ORDER_STATUS.SHIPPING,
  products: [
    {
      id: '1',
      thumbnail:
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
      name: '우먼즈 짐 액티브 롱 슬리브 (3color)',
      option: '라지 / 미디움',
      price: 17500,
      quantity: 1,
    },
    {
      id: '2',
      thumbnail:
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
      name: '우먼즈 짐 액티브 우먼즈 짐 액티브 롱 슬리브 (3color)',
      option: '',
      price: 17500,
      quantity: 1,
    },
  ],
  cancelledProducts: [
    {
      id: '3',
      thumbnail:
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
      name: '우먼즈 짐 액티브 롱 슬리브 (3color)',
      option: '라지 / 미디움',
      price: 17500,
      quantity: 1,
    },
    {
      id: '4',
      thumbnail:
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop',
      name: '우먼즈 짐 액티브 우먼즈 짐 액티브 롱 슬리브 (3color)',
      option: '',
      price: 17500,
      quantity: 1,
    },
  ],
  shipping: {
    recipientName: '김주민',
    phone: '010-0000-0000',
    address: '(12345) 서울 강남구 강남대로 123 강남아파트 102동 101호',
    request: '가나다라',
  },
  payment: {
    totalAmount: 13000,
    productAmount: 10000,
    shippingFee: 3000,
    paymentMethod: '카카오페이',
  },
};

// ============================================================================
// Mock API
// ============================================================================

/**
 * 주문 상세 조회 Mock API
 * orderId에 'ship'이 포함되면 배송 주문, 그 외에는 숙박 주문 반환
 * TODO: 실제 API 연동 시 교체 필요
 */
function fetchOrderDetail(orderNumber: string): OrderData {
  if (orderNumber.includes('ship')) {
    return { ...MOCK_SHIPPING_ORDER, orderNumber };
  }
  return { ...MOCK_ACCOMMODATION_ORDER, orderNumber };
}

// ============================================================================
// Main Component
// ============================================================================

function OrderDetailPage() {
  const { orderNumber } = Route.useParams();
  const navigate = useNavigate();

  // API에서 주문 데이터 조회 (현재는 Mock)
  const orderData = fetchOrderDetail(orderNumber);

  const handleClose = () => {
    navigate({ to: '/' });
  };

  const handleCancelRequest = () => {
    toast.success('취소 신청이 완료되었습니다.');
  };

  const handleTrackDelivery = () => {
    toast.info('배송 조회 페이지로 이동합니다.');
  };

  const handleReturnRequest = () => {
    toast.success('반품 신청이 완료되었습니다.');
  };

  const handleCancelWithdraw = () => {
    toast.success('취소 철회가 완료되었습니다.');
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
            <OrderDate>{orderData.orderDate}</OrderDate>
            <OrderNumber>주문번호: {orderData.orderNumber}</OrderNumber>
          </OrderInfoContainer>
        </Section>

        {/* Order Status Card */}
        {orderData.type === 'accommodation' ? (
          <AccommodationOrderStatusCard
            data={orderData}
            onCancelRequest={handleCancelRequest}
          />
        ) : (
          <ShippingOrderStatusCard
            data={orderData}
            onTrackDelivery={handleTrackDelivery}
            onReturnRequest={handleReturnRequest}
          />
        )}

        {/* Cancelled Products Section (배송 only) */}
        {orderData.type === 'shipping' && (
          <CancelledProductsSection
            products={orderData.cancelledProducts}
            onWithdraw={handleCancelWithdraw}
          />
        )}

        {/* User Info (숙박) or Shipping Info (배송) */}
        {orderData.type === 'accommodation' ? (
          <UserInfoSection user={orderData.user} />
        ) : (
          <ShippingInfoSection shipping={orderData.shipping} />
        )}

        {/* Payment Summary */}
        <PaymentSummarySection
          payment={orderData.payment}
          type={orderData.type}
        />
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

const OrderNumber = tw.p`
  text-[13.5px]
  leading-[18px]
  text-fg-muted
`;
