/**
 * OrderHistory Action 타입 정의
 *
 * 주문 이력에 기록되는 액션 종류를 정의합니다.
 */

export const ORDER_HISTORY_ACTION = [
  'ORDER_CREATED',
  'PAYMENT_COMPLETED',
  'STATUS_CHANGED',
  'STATUS_REVERTED',
  'CANCEL_REQUESTED',
  'CANCEL_AUTO_APPROVED',
  'CANCEL_APPROVED',
  'CANCEL_REJECTED',
  'CANCEL_WITHDRAWN',
  'ADMIN_CANCELLED',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  'REFUND_PROCESSED',
] as const;

export type OrderHistoryAction = (typeof ORDER_HISTORY_ACTION)[number];
