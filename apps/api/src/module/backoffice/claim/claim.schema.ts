/**
 * Claim Schema - 클레임 관련 Zod 스키마
 */

import { z } from 'zod';
import {
  CLAIM_TYPE,
  CLAIM_STATUS,
} from '@src/module/backoffice/domain/order/claim-type';

/** 취소 승인 입력 스키마 */
export const approveClaimInputSchema = z.object({
  orderId: z.number(),
  cancelFee: z.number(),
});

/** 취소 승인 응답 스키마 */
export const approveClaimResponseSchema = z.object({
  success: z.boolean(),
  orderId: z.number(),
  newOrderStatus: z.string(),
  cancelFee: z.number(),
  refundAmount: z.number(),
});

/** 취소 거절 입력 스키마 */
export const rejectClaimInputSchema = z.object({
  orderId: z.number(),
});

/** 취소 거절 응답 스키마 */
export const rejectClaimResponseSchema = z.object({
  success: z.boolean(),
  orderId: z.number(),
  newOrderStatus: z.string(),
});

/** 취소 수수료 미리보기 입력 스키마 */
export const getCancelFeePreviewInputSchema = z.object({
  orderId: z.number().int().positive(),
});

/** 취소 정책 항목 스키마 */
const cancelPolicyItemSchema = z.object({
  daysBeforeCheckIn: z.number(),
  feePercentage: z.number(),
});

/** 취소 수수료 미리보기 응답 스키마 */
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

/** 주문 ID로 클레임 조회 입력 스키마 */
export const findByOrderIdInputSchema = z.object({
  orderId: z.number().int().positive(),
});

/** 클레임 상세 스키마 */
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

/** 주문 ID로 클레임 조회 응답 스키마 (배열: 주문의 모든 클레임 이력) */
export const findByOrderIdOutputSchema = z.array(claimDetailSchema);
