/**
 * Claim 관련 상수 및 타입 정의
 */

// 클레임 타입
export const CLAIM_TYPE = ['CANCEL', 'RETURN'] as const;
export type ClaimType = (typeof CLAIM_TYPE)[number];

// 클레임 상태
export const CLAIM_STATUS = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'WITHDRAWN', // 철회 (고객이 취소 요청을 철회)
] as const;
export type ClaimStatus = (typeof CLAIM_STATUS)[number];

// 클레임 사유 카테고리 (취소/반품 통합)
export const CLAIM_REASON_CATEGORY = [
  'CHANGE_OF_MIND', // 단순 변심
  'WRONG_ORDER', // 주문 실수
  'DELIVERY_DELAY', // 배송 지연
  'DEFECTIVE', // 상품 불량/파손 (반품)
  'WRONG_ITEM', // 상품 오배송 (반품)
  'OTHER', // 기타
] as const;
export type ClaimReasonCategory = (typeof CLAIM_REASON_CATEGORY)[number];

// 상태 라벨
export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  REQUESTED: '요청',
  APPROVED: '승인',
  REJECTED: '거절',
  COMPLETED: '완료',
  WITHDRAWN: '철회',
};

// 클레임 타입 라벨
export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  CANCEL: '취소',
  RETURN: '반품',
};

// 사유 카테고리 라벨
export const CLAIM_REASON_CATEGORY_LABELS: Record<ClaimReasonCategory, string> =
  {
    CHANGE_OF_MIND: '단순 변심',
    WRONG_ORDER: '주문 실수',
    DELIVERY_DELAY: '배송 지연',
    DEFECTIVE: '상품 불량/파손',
    WRONG_ITEM: '상품 오배송',
    OTHER: '기타',
  };
