/**
 * OrderHistory Metadata 타입 정의
 *
 * 주문 이력의 metadata JSONB 필드에 저장되는 부가 정보입니다.
 */

import type { ClaimType, ClaimReasonCategory } from './claim-type';
import type { ClaimOptionItem } from './claim-detail.type';

export interface OrderHistoryMetadata {
  /** 환불 금액 */
  refundAmount?: number;
  /** 취소 수수료 */
  cancelFee?: number;
  /** 클레임 타입 (CANCEL | RETURN) */
  claimType?: ClaimType;
  /** 클레임 사유 텍스트 */
  claimReason?: string;
  /** 클레임 사유 카테고리 */
  claimReasonCategory?: ClaimReasonCategory;
  /** 클레임 옵션 아이템 목록 */
  claimOptionItems?: ClaimOptionItem[];
  /** 이전 결제 금액 */
  previousPaymentAmount?: number;
  /** 새 결제 금액 */
  newPaymentAmount?: number;
  /** SKU 정보 */
  skuInfo?: Array<{
    skuId: number;
    skuName: string;
    attributes: Record<string, string>;
    quantity: number;
  }>;
  /** 추가결제 ID */
  additionalPaymentId?: number;
}
