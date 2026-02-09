/**
 * Claim Detail 타입 정의
 * ClaimEntity의 detail JSONB 필드에 저장되는 타입별 상세 정보
 *
 * TODO: 각 타입별 상세 정보는 다음 기능 구현 시 활용
 * - HOTEL: 취소 정책 기반 수수료 계산 시 appliedPolicy, cancelPolicySnapshot 저장
 * - DELIVERY: 반품 처리 시 returnTrackingNumber, returnCourier, pickupAddress 저장
 * - E-TICKET: 이티켓 사용 여부 기반 취소 수수료 계산 시 활용
 */

/**
 * 클레임 옵션 아이템
 * claimOptionItems JSONB 컬럼에 저장되는 개별 옵션 정보
 *
 * 원래금액 = sum(quantity * unitPrice)
 * 환불금액 = 원래금액 - detail.cancelFee
 */
export interface ClaimOptionItem {
  /** 옵션 ID (호텔: hotelOptionId, 배송: productOptionId) */
  optionId: number;
  /** 옵션명 스냅샷 */
  optionName: string;
  /** 수량 (호텔: 1, 배송: N) */
  quantity: number;
  /** 단가 */
  unitPrice: number;
}

/**
 * 호텔 취소 정책 항목
 */
export interface HotelCancelPolicyItem {
  /** 체크인 N일 전 */
  daysBeforeCheckIn: number;
  /** 취소 수수료 퍼센트 */
  feePercentage: number;
}

/**
 * 호텔 클레임 상세 정보
 */
export interface HotelClaimDetail {
  type: 'HOTEL';
  /** 취소 수수료 */
  cancelFee: number;
  /** 적용된 정책 (어떤 조건이 적용되었는지) */
  appliedPolicy?: HotelCancelPolicyItem;
  /** 취소 정책 스냅샷 (전체 정책 기록용) */
  cancelPolicySnapshot?: HotelCancelPolicyItem[];
}

/**
 * 배송 클레임 상세 정보
 */
export interface DeliveryClaimDetail {
  type: 'DELIVERY';
  /** 취소 수수료 */
  cancelFee: number;
  /** 반품 배송비 */
  returnShippingFee: number;
  /** 반품 송장번호 */
  returnTrackingNumber?: string;
  /** 반품 택배사 */
  returnCourier?: string;
  /** 수거지 주소 */
  pickupAddress?: {
    address: string;
    detail: string;
    postalCode: string;
  };
}

/**
 * E-Ticket 클레임 상세 정보
 */
export interface ETicketClaimDetail {
  type: 'E-TICKET';
  /** 취소 수수료 */
  cancelFee: number;
}

/**
 * 클레임 상세 정보 (Union Type)
 */
export type ClaimDetail =
  | HotelClaimDetail
  | DeliveryClaimDetail
  | ETicketClaimDetail;
