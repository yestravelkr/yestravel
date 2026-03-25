/**
 * OrderHistory Action 타입 정의
 *
 * 주문 이력에 기록되는 액션 종류를 정의합니다.
 * 히스토리는 주문 상태가 변경되거나, 클레임(취소/반품)이 발생할 때 기록됩니다.
 *
 * ## 기록 원칙
 * 1. Order.status가 변경되는 모든 시점에 기록
 * 2. Claim 관련 액션은 Order.status 변경 없이도 기록 (감사 추적용)
 * 3. 환불(REFUND_PROCESSED)은 상태 변경과 별도로 항상 분리 기록
 *
 * ## 액션 목록
 *
 * ### 주문/결제 (Actor: SYSTEM)
 * - ORDER_CREATED: 결제 완료 후 주문 생성 시 (null → PENDING) — ShopPaymentService
 * - PAYMENT_COMPLETED: 결제 승인 완료 시 (PENDING → PAID) — ShopPaymentService
 *
 * ### 관리자 상태 변경 (Actor: ADMIN)
 * - STATUS_CHANGED: 관리자가 주문 상태를 수동 변경 시 — OrderService
 * - STATUS_REVERTED: 관리자가 이전 상태로 되돌릴 시 (Hotel만 지원) — OrderService
 * - ADMIN_CANCELLED: 관리자가 Claim 없이 직접 취소 시 (→ CANCELLED) — OrderService
 *
 * ### 고객 클레임 요청 (Actor: USER)
 * - CANCEL_REQUESTED: 고객이 취소 요청 시 (Order.status 변경 없음) — ShopClaimService
 * - RETURN_REQUESTED: 고객이 반품 요청 시 (Order.status 변경 없음) — ShopClaimService
 * - CANCEL_WITHDRAWN: 고객이 취소 요청을 철회 시 (Order.status 변경 없음) — ShopClaimService
 *
 * ### 클레임 자동 처리 (Actor: SYSTEM)
 * - CANCEL_AUTO_APPROVED: PAID 상태에서 취소 시 자동 승인 (→ CANCELLED) — ShopClaimService
 *
 * ### 관리자 클레임 처리 (Actor: ADMIN)
 * - CANCEL_APPROVED: 관리자가 취소 클레임 승인 시 (→ CANCELLED) — ClaimService
 * - CANCEL_REJECTED: 관리자가 취소 클레임 거절 시 (Order.status 변경 없음) — ClaimService
 * - RETURN_APPROVED: 관리자가 반품 클레임 승인 시 (→ CANCELLED) — ClaimService
 * - RETURN_REJECTED: 관리자가 반품 클레임 거절 시 (Order.status 변경 없음) — ClaimService
 *
 * ### 환불 (Actor: SYSTEM 또는 ADMIN)
 * - REFUND_PROCESSED: 환불 처리 완료 시 (CANCELLED → CANCELLED, metadata에 refundAmount 포함) — 여러 Service
 *
 * ### 추가결제 (Actor: ADMIN/SYSTEM)
 * - ADDITIONAL_PAYMENT_REQUESTED: 관리자가 추가결제 링크 생성 시 (Order.status 변경 없음, metadata에 additionalPaymentId) — AdditionalPaymentService
 * - ADDITIONAL_PAYMENT_COMPLETED: 고객이 추가결제 완료 시 (Order.status 변경 없음, metadata에 additionalPaymentId) — ShopPaymentService
 * - ADDITIONAL_PAYMENT_CANCELLED: 관리자가 추가결제 무효화 시 (Order.status 변경 없음, metadata에 additionalPaymentId) — AdditionalPaymentService
 */

export const ORDER_HISTORY_ACTION = [
  // 주문/결제 (SYSTEM)
  'ORDER_CREATED',
  'PAYMENT_COMPLETED',
  // 관리자 상태 변경 (ADMIN)
  'STATUS_CHANGED',
  'STATUS_REVERTED',
  'ADMIN_CANCELLED',
  // 고객 클레임 요청 (USER)
  'CANCEL_REQUESTED',
  'RETURN_REQUESTED',
  'CANCEL_WITHDRAWN',
  // 클레임 자동 처리 (SYSTEM)
  'CANCEL_AUTO_APPROVED',
  // 관리자 클레임 처리 (ADMIN)
  'CANCEL_APPROVED',
  'CANCEL_REJECTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  // 환불 (SYSTEM/ADMIN)
  'REFUND_PROCESSED',
  // 추가결제 (ADMIN/SYSTEM)
  'ADDITIONAL_PAYMENT_REQUESTED',
  'ADDITIONAL_PAYMENT_COMPLETED',
  'ADDITIONAL_PAYMENT_CANCELLED',
] as const;

export type OrderHistoryAction = (typeof ORDER_HISTORY_ACTION)[number];
