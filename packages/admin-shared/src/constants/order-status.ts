/** 주문 원본 상태 (12개 - DB 상태) */
export type OrderBaseStatus =
  | 'PENDING'
  | 'PAID'
  | 'PENDING_RESERVATION'
  | 'RESERVATION_CONFIRMED'
  | 'COMPLETED'
  | 'PREPARING_SHIPMENT'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'PURCHASE_CONFIRMED'
  | 'CANCELLED'
  | 'RETURNING'
  | 'RETURNED';

/** 표시용 상태 (14개 - 원본 + 클레임 합성 상태) */
export type OrderDisplayStatus =
  | OrderBaseStatus
  | 'CANCEL_REQUESTED'
  | 'RETURN_REQUESTED';

/** 상태 탭 타입 (전체 주문 포함) */
export type OrderStatusTab = 'ALL' | OrderDisplayStatus;

/** 상태별 라벨 */
export const ORDER_STATUS_LABELS: Record<OrderDisplayStatus | 'ALL', string> = {
  ALL: '전체 주문',
  PENDING: '결제대기',
  PAID: '결제완료',
  PENDING_RESERVATION: '예약대기',
  RESERVATION_CONFIRMED: '예약확정',
  COMPLETED: '이용완료',
  PREPARING_SHIPMENT: '배송준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  PURCHASE_CONFIRMED: '구매확정',
  CANCEL_REQUESTED: '취소요청',
  RETURN_REQUESTED: '반품요청',
  CANCELLED: '취소완료',
  RETURNING: '반품중',
  RETURNED: '반품완료',
};

/** 알림 표시가 필요한 상태 (빨간 점) */
export const ALERT_STATUSES: OrderDisplayStatus[] = ['PAID', 'CANCEL_REQUESTED'];

/** 기간 타입 옵션 */
export const PERIOD_TYPE_OPTIONS = [
  { value: 'PAYMENT_DATE', label: '결제일' },
  { value: 'ORDER_DATE', label: '주문일' },
  { value: 'USAGE_DATE', label: '이용일' },
];

/** 기간 프리셋 옵션 */
export const PERIOD_PRESET_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: '7days', label: '최근 7일' },
  { value: '1month', label: '1개월' },
  { value: '2months', label: '2개월' },
  { value: '3months', label: '3개월' },
  { value: 'custom', label: '직접입력' },
];

/** 주문 상태 옵션 (숙박용) */
export const ORDER_STATUS_OPTIONS = [
  { value: 'PAID', label: '결제완료' },
  { value: 'PENDING_RESERVATION', label: '예약대기' },
  { value: 'RESERVATION_CONFIRMED', label: '예약확정' },
  { value: 'COMPLETED', label: '이용완료' },
  { value: 'CANCELLED', label: '취소완료' },
];

/** 상태별 액션 버튼 정보 */
export const STATUS_ACTION_CONFIG: Partial<
  Record<OrderBaseStatus, { label: string; nextStatus: OrderBaseStatus }>
> = {
  PAID: { label: '주문확인', nextStatus: 'PENDING_RESERVATION' },
  PENDING_RESERVATION: {
    label: '예약확정',
    nextStatus: 'RESERVATION_CONFIRMED',
  },
};
