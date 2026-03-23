import { z } from 'zod';
import {
  CLAIM_TYPE,
  CLAIM_STATUS,
} from '@src/module/backoffice/domain/order/claim-type';

// ===== Create Claim =====

export const createClaimInputSchema = z.object({
  /** 주문 ID */
  orderId: z.number().int().positive(),
  /** 클레임 타입: CANCEL | RETURN */
  type: z.enum(CLAIM_TYPE),
  /** 취소/반품 사유 */
  reason: z.string(),
  /** 증빙자료 URL 목록 (선택) */
  evidenceUrls: z.array(z.string().url()).nullish(),
  /** 클레임 옵션 아이템 목록 */
  claimOptionItems: z
    .array(
      z.object({
        optionId: z.number().int().positive(),
        optionName: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export const createClaimOutputSchema = z.object({
  /** 생성된 클레임 ID */
  claimId: z.number(),
  /** 클레임 상태 */
  status: z.enum(CLAIM_STATUS),
  /** 예상 환불 금액 */
  estimatedRefundAmount: z.number(),
  /** 취소 수수료 */
  cancelFee: z.number(),
  /** 원래 주문 금액 */
  originalAmount: z.number(),
});

// ===== Get Claim by Order ID =====

export const getClaimByOrderIdInputSchema = z.object({
  orderId: z.number().int().positive(),
});

export const claimDetailSchema = z.object({
  id: z.number(),
  type: z.enum(CLAIM_TYPE),
  status: z.enum(CLAIM_STATUS),
  reason: z.string(),
  evidenceUrls: z.array(z.string()).nullish(),
  claimOptionItems: z.array(
    z.object({
      optionId: z.number(),
      optionName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    })
  ),
  cancelFee: z.number(),
  createdAt: z.date(),
});

export const getClaimByOrderIdOutputSchema = claimDetailSchema.nullish();

// ===== Cancel Fee Preview (취소 수수료 미리보기) =====

export const getCancelFeePreviewInputSchema = z.object({
  /** 주문 ID */
  orderId: z.number().int().positive(),
});

/** 취소 정책 항목 스키마 */
const cancelPolicyItemSchema = z.object({
  daysBeforeCheckIn: z.number(),
  feePercentage: z.number(),
});

export const getCancelFeePreviewOutputSchema = z.object({
  /** 취소 수수료 금액 */
  cancelFee: z.number(),
  /** 적용된 수수료율 (%) */
  feePercentage: z.number(),
  /** 체크인까지 남은 일수 */
  daysBeforeCheckIn: z.number(),
  /** 주문 총액 */
  totalAmount: z.number(),
  /** 환불 예상 금액 */
  refundAmount: z.number(),
  /** 당일 취소 차단 여부 */
  isSameDayCancelBlocked: z.boolean(),
  /** 적용된 정책 항목 */
  appliedPolicy: cancelPolicyItemSchema.optional(),
  /** 전체 정책 스냅샷 */
  cancelPolicySnapshot: z.array(cancelPolicyItemSchema),
});

// ===== Withdraw Claim (취소 철회) =====

export const withdrawClaimInputSchema = z.object({
  orderId: z.number().int().positive(),
});

export const withdrawClaimOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.number(),
  newOrderStatus: z.string(),
});
