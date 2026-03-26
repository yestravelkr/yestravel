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
 *   hasActiveAdditionalPayment={false}
 * />
 */

import tw from 'tailwind-styled-components';

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
  onCancelOrder?: () => void;
  onCancelRequest?: () => void;
  /** 추가결제가 진행 중인지 여부 */
  hasActiveAdditionalPayment?: boolean;
}

/** 취소 신청이 가능한 상태 (어드민 승인 필요) */
const CANCEL_REQUEST_STATUSES: OrderStatusType[] = [
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
];

export function AccommodationOrderStatusCard({
  data,
  onCancelOrder,
  onCancelRequest,
  hasActiveAdditionalPayment = false,
}: AccommodationOrderStatusCardProps) {
  const isPaid = data.status === 'PAID';
  const canCancelRequest = CANCEL_REQUEST_STATUSES.includes(data.status);

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
      {hasActiveAdditionalPayment && (
        <AdditionalPaymentNotice>
          추가결제가 진행 중이므로 취소가 불가합니다. 고객센터에 문의해주세요.
        </AdditionalPaymentNotice>
      )}
      {!hasActiveAdditionalPayment && isPaid && (
        <OrderStatusCard.Actions>
          <OrderStatusCard.SubtleButton onClick={onCancelOrder}>
            주문 취소
          </OrderStatusCard.SubtleButton>
        </OrderStatusCard.Actions>
      )}
      {!hasActiveAdditionalPayment && canCancelRequest && (
        <OrderStatusCard.Actions>
          <OrderStatusCard.SubtleButton onClick={onCancelRequest}>
            취소 신청
          </OrderStatusCard.SubtleButton>
        </OrderStatusCard.Actions>
      )}
    </OrderStatusCard>
  );
}

// ============================================================================
// Styled Components
// ============================================================================

const AdditionalPaymentNotice = tw.p`
  mx-5
  mb-4
  px-4
  py-3
  bg-yellow-50
  text-yellow-800
  text-[13.5px]
  leading-[18px]
  rounded-lg
`;
