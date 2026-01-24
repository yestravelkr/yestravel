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
  ALL: 155,
  PENDING_PAYMENT: 30,
  PAID: 5,
  PENDING_BOOKING: 45,
  BOOKING_CONFIRMED: 35,
  CLAIM_REQUESTED: 20,
  CLAIM_COMPLETED: 10,
  COMPLETED: 10,
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
  paymentAmount: number;
  request: string;
  buyerName: string;
  buyerPhone: string;
}

/** 상태 목록 (ALL 제외) */
const STATUSES: HotelOrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PENDING_BOOKING',
  'BOOKING_CONFIRMED',
  'CLAIM_REQUESTED',
  'CLAIM_COMPLETED',
  'COMPLETED',
];

const REQUESTS = ['', '늦은 체크인 요청', '조용한 방 요청', '높은 층 요청', ''];
const BUYER_NAMES = [
  '김민수',
  '이영희',
  '박지훈',
  '최서연',
  '정현우',
  '강미나',
];

/** 기간 타입 옵션 */
export const PERIOD_TYPE_OPTIONS = [
  { value: 'payment', label: '결제일' },
  { value: 'order', label: '주문일' },
  { value: 'usage', label: '이용일' },
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

/** 주문 상태 옵션 */
export const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PENDING_BOOKING', label: '예약대기' },
  { value: 'BOOKING_CONFIRMED', label: '예약확정' },
  { value: 'CLAIM_REQUESTED', label: '클레임 요청' },
  { value: 'CLAIM_COMPLETED', label: '클레임 완료' },
  { value: 'COMPLETED', label: '이용완료' },
];

/** 캠페인 목록 (Mock) */
export const CAMPAIGN_OPTIONS = [
  { value: '1', label: '캠페인1' },
  { value: '2', label: '캠페인2' },
  { value: '3', label: '캠페인3' },
  { value: '4', label: '캠페인4' },
  { value: '5', label: '캠페인5' },
];

/** 인플루언서 목록 (Mock) */
export const INFLUENCER_OPTIONS = [
  { value: '1', label: '인플루언서1' },
  { value: '2', label: '인플루언서2' },
  { value: '3', label: '인플루언서3' },
  { value: '4', label: '인플루언서4' },
  { value: '5', label: '인플루언서5' },
  { value: '6', label: '인플루언서6' },
  { value: '7', label: '인플루언서7' },
  { value: '8', label: '인플루언서8' },
  { value: '9', label: '인플루언서9' },
  { value: '10', label: '인플루언서10' },
];

/** 상품 목록 (Mock) */
export const PRODUCT_OPTIONS = [
  { value: '1', label: '오션뷰 리조트' },
  { value: '2', label: '시티 호텔' },
  { value: '3', label: '마운틴 펜션' },
  { value: '4', label: '풀빌라' },
];

/** 옵션 목록 (Mock) */
export const OPTION_OPTIONS = [
  { value: '1', label: '패키지1' },
  { value: '2', label: '패키지2' },
  { value: '3', label: '패키지3' },
];

/** Mock 주문 데이터 생성 (상태별로 분포) */
const generateMockOrders = (): HotelOrder[] => {
  const orders: HotelOrder[] = [];
  let id = 1;

  STATUSES.forEach((status) => {
    const count = mockStatusCounts[status];
    for (let i = 0; i < count; i++) {
      orders.push({
        id: id,
        orderNumber: `2501${String(id).padStart(4, '0')}`,
        status,
        paidAt: `25.01.${String((id % 28) + 1).padStart(2, '0')} ${String((id % 12) + 9).padStart(2, '0')}:00`,
        campaignName: `캠페인${(id % 5) + 1}`,
        influencerName: `인플루언서${(id % 10) + 1}`,
        productName: ['오션뷰 리조트', '시티 호텔', '마운틴 펜션', '풀빌라'][
          id % 4
        ],
        optionName: `패키지${(id % 3) + 1}`,
        checkInDate: `25.01.${String((id % 28) + 1).padStart(2, '0')}`,
        checkOutDate: `25.01.${String((id % 28) + 2).padStart(2, '0')}`,
        paymentAmount: [89000, 120000, 150000, 200000, 250000][id % 5],
        request: REQUESTS[id % 5],
        buyerName: BUYER_NAMES[id % 6],
        buyerPhone: `010-${String(1000 + (id % 9000)).padStart(4, '0')}-${String(1000 + ((id * 7) % 9000)).padStart(4, '0')}`,
      });
      id++;
    }
  });

  return orders;
};

export const mockHotelOrders: HotelOrder[] = generateMockOrders();

/** 필터링 + 페이지네이션 적용 */
export function getFilteredOrders(
  status: OrderStatusTab,
  page: number,
  limit: number,
): { orders: HotelOrder[]; totalCount: number } {
  const filtered =
    status === 'ALL'
      ? mockHotelOrders
      : mockHotelOrders.filter((order) => order.status === status);

  const totalCount = filtered.length;
  const startIndex = (page - 1) * limit;
  const orders = filtered.slice(startIndex, startIndex + limit);

  return { orders, totalCount };
}

/** 주문 상세 아이템 타입 */
export interface HotelOrderItem {
  id: number;
  productName: string;
  optionName: string;
  checkInDate: string;
  checkOutDate: string;
  amount: number;
}

/** 주문 상세 결제 정보 */
export interface PaymentInfo {
  paymentMethod: string;
  productAmount: number;
  refundAmount: number;
  totalAmount: number;
}

/** 주문 상세 회원 정보 */
export interface MemberInfo {
  name: string;
  phone: string;
}

/** 주문 상세 데이터 타입 */
export interface HotelOrderDetail {
  id: number;
  orderNumber: string;
  campaignName: string;
  influencerName: string;
  orderedAt: string;
  status: HotelOrderStatus;
  statusLabel: string;
  statusDate: string;
  items: HotelOrderItem[];
  payment: PaymentInfo;
  member: MemberInfo;
}

/** 주문 상세 Mock 데이터 조회 */
export function getOrderDetail(orderId: string): HotelOrderDetail | null {
  const order = mockHotelOrders.find((o) => o.id === Number(orderId));
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    campaignName: order.campaignName,
    influencerName: order.influencerName,
    orderedAt: order.paidAt,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    statusDate: order.paidAt,
    items: [
      {
        id: 1,
        productName: order.productName,
        optionName: order.optionName,
        checkInDate: order.checkInDate,
        checkOutDate: order.checkOutDate,
        amount: order.paymentAmount,
      },
    ],
    payment: {
      paymentMethod: '카드',
      productAmount: order.paymentAmount,
      refundAmount: 0,
      totalAmount: order.paymentAmount,
    },
    member: {
      name: order.buyerName,
      phone: order.buyerPhone,
    },
  };
}

/** 주문별 상태 탭 목록 (상세 페이지용) */
export function getOrderDetailTabs(orderStatus: HotelOrderStatus) {
  return [
    {
      key: 'ALL' as const,
      label: '전체 주문',
    },
    {
      key: orderStatus,
      label: ORDER_STATUS_LABELS[orderStatus],
      count: 1,
      hasAlert: ALERT_STATUSES.includes(orderStatus),
    },
  ];
}
