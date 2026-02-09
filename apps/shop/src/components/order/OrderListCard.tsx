/**
 * OrderListCard - 주문내역 리스트 카드
 *
 * 주문내역 목록에서 각 주문을 요약하여 표시하는 카드 컴포넌트입니다.
 *
 * Usage:
 * <OrderListCard
 *   order={orderData}
 *   onClick={() => navigate({ to: '/order/$orderNumber' })}
 * />
 */

import { ChevronRight } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { ORDER_STATUS } from './OrderStatusCard';

export interface OrderListItem {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  accommodation: {
    thumbnail?: string | null;
    hotelName: string;
    optionName: string;
  };
  checkIn: {
    date: string;
  };
  checkOut: {
    date: string;
  };
}

export interface OrderListCardProps {
  /** 주문 정보 */
  order: OrderListItem;
  /** 카드 클릭 핸들러 */
  onClick: () => void;
}

/**
 * 주문 상태 한글 라벨
 */
const STATUS_LABEL: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '결제 대기',
  [ORDER_STATUS.PAID]: '결제 완료',
  [ORDER_STATUS.PENDING_RESERVATION]: '예약 대기',
  [ORDER_STATUS.RESERVATION_CONFIRMED]: '예약 확정',
  [ORDER_STATUS.COMPLETED]: '이용 완료',
  [ORDER_STATUS.CANCEL_REQUESTED]: '취소 요청',
  [ORDER_STATUS.CANCELLED]: '취소됨',
};

/**
 * 주문 상태별 색상
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return 'text-orange-500';
    case ORDER_STATUS.PAID:
    case ORDER_STATUS.PENDING_RESERVATION:
      return 'text-blue-500';
    case ORDER_STATUS.RESERVATION_CONFIRMED:
      return 'text-green-600';
    case ORDER_STATUS.COMPLETED:
      return 'text-fg-muted';
    case ORDER_STATUS.CANCEL_REQUESTED:
    case ORDER_STATUS.CANCELLED:
      return 'text-red-500';
    default:
      return 'text-fg-neutral';
  }
};

export function OrderListCard({ order, onClick }: OrderListCardProps) {
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const statusColor = getStatusColor(order.status);

  return (
    <CardContainer onClick={onClick}>
      <CardHeader>
        <OrderDate>{order.orderDate}</OrderDate>
        <StatusBadge className={statusColor}>{statusLabel}</StatusBadge>
      </CardHeader>

      <CardBody>
        <Thumbnail>
          {order.accommodation.thumbnail ? (
            <ThumbnailImage
              src={order.accommodation.thumbnail}
              alt={order.accommodation.hotelName}
            />
          ) : (
            <ThumbnailPlaceholder />
          )}
        </Thumbnail>

        <OrderInfo>
          <HotelName>{order.accommodation.hotelName}</HotelName>
          <OptionName>{order.accommodation.optionName}</OptionName>
          <DateRange>
            {order.checkIn.date} ~ {order.checkOut.date}
          </DateRange>
          <TotalAmount>{order.totalAmount.toLocaleString()}원</TotalAmount>
        </OrderInfo>

        <ChevronWrapper>
          <ChevronRight size={20} />
        </ChevronWrapper>
      </CardBody>
    </CardContainer>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const CardContainer = tw.div`
  bg-white
  rounded-xl
  p-4
  cursor-pointer
  transition-colors
  hover:bg-gray-50
  active:bg-gray-100
`;

const CardHeader = tw.div`
  flex items-center justify-between
  mb-3
`;

const OrderDate = tw.span`
  text-sm
  text-fg-muted
`;

const StatusBadge = tw.span`
  text-sm
  font-medium
`;

const CardBody = tw.div`
  flex gap-3
`;

const Thumbnail = tw.div`
  w-20 h-20
  flex-shrink-0
  rounded-lg
  overflow-hidden
`;

const ThumbnailImage = tw.img`
  w-full h-full
  object-cover
`;

const ThumbnailPlaceholder = tw.div`
  w-full h-full
  bg-gray-200
`;

const OrderInfo = tw.div`
  flex flex-col
  flex-1
  min-w-0
`;

const HotelName = tw.p`
  text-base
  font-semibold
  text-fg-neutral
  truncate
`;

const OptionName = tw.p`
  text-sm
  text-fg-muted
  truncate
`;

const DateRange = tw.p`
  text-sm
  text-fg-muted
  mt-1
`;

const TotalAmount = tw.p`
  text-base
  font-bold
  text-fg-neutral
  mt-auto
`;

const ChevronWrapper = tw.div`
  flex items-center
  text-fg-muted
`;
