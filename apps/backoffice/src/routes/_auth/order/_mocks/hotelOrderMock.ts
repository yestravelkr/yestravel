/**
 * Hotel Order Mock Data - 숙박 주문 목 데이터
 *
 * 숙박 주문 관리 페이지의 목 데이터 및 타입 정의
 */

/** 주문 상태 타입 */
export type HotelOrderStatus =
  | 'PENDING_PAYMENT' // 결제대기
  | 'PAID' // 결제완료
  | 'PENDING_BOOKING' // 예약대기
  | 'BOOKING_CONFIRMED' // 예약확정
  | 'CLAIM_REQUESTED' // 클레임 요청
  | 'CLAIM_COMPLETED' // 클레임 완료
  | 'COMPLETED'; // 이용완료

/** 상태 탭 타입 (전체 주문 포함) */
export type OrderStatusTab = 'ALL' | HotelOrderStatus;

/** 상태별 라벨 */
export const ORDER_STATUS_LABELS: Record<OrderStatusTab, string> = {
  ALL: '전체 주문',
  PENDING_PAYMENT: '결제대기',
  PAID: '결제완료',
  PENDING_BOOKING: '예약대기',
  BOOKING_CONFIRMED: '예약확정',
  CLAIM_REQUESTED: '클레임 요청',
  CLAIM_COMPLETED: '클레임 완료',
  COMPLETED: '이용완료',
};

/** 알림 표시가 필요한 상태 (빨간 점) */
export const ALERT_STATUSES: OrderStatusTab[] = [
  'PAID',
  'PENDING_BOOKING',
  'CLAIM_REQUESTED',
];

/** 상태별 카운트 (Mock) */
export const mockStatusCounts: Record<OrderStatusTab, number> = {
  ALL: 30,
  PENDING_PAYMENT: 30,
  PAID: 5,
  PENDING_BOOKING: 30,
  BOOKING_CONFIRMED: 30,
  CLAIM_REQUESTED: 30,
  CLAIM_COMPLETED: 0,
  COMPLETED: 0,
};

/** StatusTabs용 탭 목록 생성 */
export function getOrderStatusTabs() {
  const tabOrder: OrderStatusTab[] = [
    'ALL',
    'PENDING_PAYMENT',
    'PAID',
    'PENDING_BOOKING',
    'BOOKING_CONFIRMED',
    'CLAIM_REQUESTED',
    'CLAIM_COMPLETED',
    'COMPLETED',
  ];

  return tabOrder.map((key) => ({
    key,
    label: ORDER_STATUS_LABELS[key],
    count: mockStatusCounts[key],
    hasAlert: ALERT_STATUSES.includes(key) && mockStatusCounts[key] > 0,
  }));
}

/** 주문 데이터 타입 */
export interface HotelOrder {
  id: number;
  orderNumber: string;
  status: HotelOrderStatus;
  paidAt: string;
  campaignName: string;
  influencerName: string;
  productName: string;
  optionName: string;
  checkInDate: string;
  checkOutDate: string;
}

/** Mock 주문 데이터 (30건) */
export const mockHotelOrders: HotelOrder[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    orderNumber: `250101${String(i + 1).padStart(2, '0')}`,
    status: 'PAID' as HotelOrderStatus,
    paidAt: '25.01.01 13:00',
    campaignName: '캠페인명',
    influencerName: '인플루언서명',
    productName: '오션뷰 숙소명',
    optionName: '패키지1',
    checkInDate: '25.01.01',
    checkOutDate: '25.01.02',
  }),
);
