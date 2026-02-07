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
  refundAmount: z.number(),
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
  originalAmount: z.number(),
  refundAmount: z.number(),
  createdAt: z.date(),
});

/** 주문 ID로 클레임 조회 응답 스키마 */
export const findByOrderIdOutputSchema = claimDetailSchema.nullish();
