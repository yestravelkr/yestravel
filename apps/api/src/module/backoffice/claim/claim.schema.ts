/**
 * Claim Schema - 클레임 관련 Zod 스키마
 */

import { z } from 'zod';

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
