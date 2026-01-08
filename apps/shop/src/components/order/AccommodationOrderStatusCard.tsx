/**
 * AccommodationOrderStatusCard - 숙박 주문 상태 카드
 *
 * 숙박 주문의 상태를 표시하는 컴포넌트입니다.
 * OrderStatusCard 컴파운드 컴포넌트를 사용합니다.
 *
 * Usage:
 * <AccommodationOrderStatusCard
 *   data={accommodationOrderData}
 *   onCancelRequest={() => console.log('취소 신청')}
 * />
 */

import { OrderStatusCard, type OrderStatusType } from './OrderStatusCard';

export interface AccommodationOrderData {
  status: OrderStatusType;
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
}

export interface AccommodationOrderStatusCardProps {
  data: AccommodationOrderData;
  onCancelRequest: () => void;
}

export function AccommodationOrderStatusCard({
  data,
  onCancelRequest,
}: AccommodationOrderStatusCardProps) {
  return (
    <OrderStatusCard>
      <OrderStatusCard.Header status={data.status}>
        {data.statusDescription}
      </OrderStatusCard.Header>
      <OrderStatusCard.AccommodationInfo
        thumbnail={data.accommodation.thumbnail}
        hotelName={data.accommodation.hotelName}
        roomName={data.accommodation.roomName}
        optionName={data.accommodation.optionName}
      />
      <OrderStatusCard.Divider />
      <OrderStatusCard.CheckTime
        checkIn={data.checkIn}
        checkOut={data.checkOut}
      />
      <OrderStatusCard.Actions>
        <OrderStatusCard.SubtleButton onClick={onCancelRequest}>
          취소 신청
        </OrderStatusCard.SubtleButton>
      </OrderStatusCard.Actions>
    </OrderStatusCard>
  );
}
