import { z } from 'zod';
import {
  CLAIM_TYPE,
  CLAIM_REASON_CATEGORY,
  CLAIM_STATUS,
} from '@src/module/backoffice/domain/order/claim-type';

// ===== Create Claim =====

export const createClaimInputSchema = z.object({
  /** 주문 ID */
  orderId: z.number().int().positive(),
  /** 클레임 타입: CANCEL | RETURN */
  type: z.enum(CLAIM_TYPE),
  /** 사유 카테고리 */
  reasonCategory: z.enum(CLAIM_REASON_CATEGORY),
  /** 상세 사유 (선택) */
  reasonDetail: z.string().nullish(),
  /** 증빙자료 URL 목록 (선택) */
  evidenceUrls: z.array(z.string().url()).nullish(),
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
  reasonCategory: z.enum(CLAIM_REASON_CATEGORY),
  reasonDetail: z.string().nullish(),
  evidenceUrls: z.array(z.string()).nullish(),
  originalAmount: z.number(),
  refundAmount: z.number(),
  createdAt: z.date(),
});

export const getClaimByOrderIdOutputSchema = claimDetailSchema.nullish();

// ===== Withdraw Claim (취소 철회) =====

export const withdrawClaimInputSchema = z.object({
  orderId: z.number().int().positive(),
});

export const withdrawClaimOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.number(),
  newOrderStatus: z.string(),
});
