/**
 * 주문 상태 도메인 로직
 *
 * 숙박(HOTEL) 및 배송(DELIVERY) 상품의 주문 상태를 정의하고
 * 상태 전이 규칙을 관리합니다.
 */

import type { ProductTypeEnumType } from '@src/module/backoffice/admin/admin.schema';

// ===== 상태 Enum 정의 (14개) =====

export const ORDER_STATUS_ENUM_VALUE = [
  'PENDING', // 결제 대기 (TmpOrder → Order 변환 시 초기 상태)
  'PAID', // 결제 완료
  'PENDING_RESERVATION', // 예약 대기 (숙박)
  'RESERVATION_CONFIRMED', // 예약 확정 (숙박)
  'COMPLETED', // 이용 완료 (숙박)
  'PREPARING_SHIPMENT', // 배송 준비중 (배송)
  'SHIPPING', // 배송중 (배송)
  'DELIVERED', // 배송 완료 (배송)
  'PURCHASE_CONFIRMED', // 구매 확정 (배송)
  'CANCEL_REQUESTED', // 취소 요청
  'CANCELLED', // 취소 완료
  'RETURN_REQUESTED', // 반품 요청 (배송)
  'RETURNING', // 반품중 (배송)
  'RETURNED', // 반품 완료 (배송)
] as const;

export type OrderStatusEnumType = (typeof ORDER_STATUS_ENUM_VALUE)[number];

export const OrderStatusEnum = {
  /** 결제 대기 */
  PENDING: 'PENDING',
  /** 결제 완료 */
  PAID: 'PAID',
  /** 예약 대기 (숙박) */
  PENDING_RESERVATION: 'PENDING_RESERVATION',
  /** 예약 확정 (숙박) */
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  /** 이용 완료 (숙박) */
  COMPLETED: 'COMPLETED',
  /** 배송 준비중 (배송) */
  PREPARING_SHIPMENT: 'PREPARING_SHIPMENT',
  /** 배송중 (배송) */
  SHIPPING: 'SHIPPING',
  /** 배송 완료 (배송) */
  DELIVERED: 'DELIVERED',
  /** 구매 확정 (배송) */
  PURCHASE_CONFIRMED: 'PURCHASE_CONFIRMED',
  /** 취소 요청 */
  CANCEL_REQUESTED: 'CANCEL_REQUESTED',
  /** 취소 완료 */
  CANCELLED: 'CANCELLED',
  /** 반품 요청 (배송) */
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  /** 반품중 (배송) */
  RETURNING: 'RETURNING',
  /** 반품 완료 (배송) */
  RETURNED: 'RETURNED',
} as const;

// ===== 상품 타입별 유효 상태 =====

/** 숙박 상품에서 사용 가능한 상태 */
export const HOTEL_ORDER_STATUSES: OrderStatusEnumType[] = [
  'PENDING',
  'PAID',
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
  'COMPLETED',
  'CANCEL_REQUESTED',
  'CANCELLED',
];

/** 배송 상품에서 사용 가능한 상태 */
export const DELIVERY_ORDER_STATUSES: OrderStatusEnumType[] = [
  'PENDING',
  'PAID',
  'PREPARING_SHIPMENT',
  'SHIPPING',
  'DELIVERED',
  'PURCHASE_CONFIRMED',
  'CANCEL_REQUESTED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNING',
  'RETURNED',
];

// ===== 상태 전이 규칙 =====

type StatusTransitions = Record<OrderStatusEnumType, OrderStatusEnumType[]>;

/** 숙박 상품 상태 전이 규칙 */
const HOTEL_STATUS_TRANSITIONS: Partial<StatusTransitions> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PENDING_RESERVATION', 'CANCEL_REQUESTED', 'CANCELLED'],
  PENDING_RESERVATION: ['RESERVATION_CONFIRMED', 'CANCEL_REQUESTED'],
  RESERVATION_CONFIRMED: ['COMPLETED', 'CANCEL_REQUESTED'],
  CANCEL_REQUESTED: ['CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

/** 배송 상품 상태 전이 규칙 */
const DELIVERY_STATUS_TRANSITIONS: Partial<StatusTransitions> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PREPARING_SHIPMENT', 'CANCEL_REQUESTED', 'CANCELLED'],
  PREPARING_SHIPMENT: ['SHIPPING', 'CANCEL_REQUESTED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: ['PURCHASE_CONFIRMED', 'RETURN_REQUESTED'],
  PURCHASE_CONFIRMED: [],
  CANCEL_REQUESTED: ['CANCELLED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURNING'],
  RETURNING: ['RETURNED'],
  RETURNED: [],
};

/**
 * 상태 전이 가능 여부 검증
 *
 * @param productType - 상품 타입 (HOTEL, DELIVERY)
 * @param fromStatus - 현재 상태
 * @param toStatus - 변경할 상태
 * @returns 전이 가능 여부
 */
export function canTransition(
  productType: ProductTypeEnumType,
  fromStatus: OrderStatusEnumType,
  toStatus: OrderStatusEnumType
): boolean {
  const transitions =
    productType === 'HOTEL'
      ? HOTEL_STATUS_TRANSITIONS
      : DELIVERY_STATUS_TRANSITIONS;

  const allowedTransitions = transitions[fromStatus];
  if (!allowedTransitions) {
    return false;
  }

  return allowedTransitions.includes(toStatus);
}

/**
 * 특정 상태에서 전이 가능한 상태 목록 조회
 */
export function getAvailableTransitions(
  productType: ProductTypeEnumType,
  currentStatus: OrderStatusEnumType
): OrderStatusEnumType[] {
  const transitions =
    productType === 'HOTEL'
      ? HOTEL_STATUS_TRANSITIONS
      : DELIVERY_STATUS_TRANSITIONS;

  return transitions[currentStatus] ?? [];
}

// ===== 상태 라벨 =====

/** 주문 상태별 한글 라벨 */
export const ORDER_STATUS_LABELS: Record<OrderStatusEnumType, string> = {
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
  CANCELLED: '취소완료',
  RETURN_REQUESTED: '반품요청',
  RETURNING: '반품중',
  RETURNED: '반품완료',
};

/**
 * 상태 라벨 조회 (unknown 상태 대응)
 */
export function getStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatusEnumType] ?? status;
}
