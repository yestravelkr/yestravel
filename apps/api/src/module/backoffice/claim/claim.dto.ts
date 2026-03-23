/**
 * Claim DTO - 클레임 관련 DTO
 */

import type { z } from 'zod';
import type {
  approveClaimInputSchema,
  approveClaimResponseSchema,
  rejectClaimInputSchema,
  rejectClaimResponseSchema,
  getCancelFeePreviewInputSchema,
  getCancelFeePreviewOutputSchema,
  findByOrderIdInputSchema,
  findByOrderIdOutputSchema,
} from './claim.schema';

/** 취소 승인 입력 */
export type ApproveClaimInput = z.infer<typeof approveClaimInputSchema>;

/** 취소 승인 응답 */
export type ApproveClaimResponse = z.infer<typeof approveClaimResponseSchema>;

/** 취소 거절 입력 */
export type RejectClaimInput = z.infer<typeof rejectClaimInputSchema>;

/** 취소 거절 응답 */
export type RejectClaimResponse = z.infer<typeof rejectClaimResponseSchema>;

/** 취소 수수료 미리보기 입력 */
export type GetCancelFeePreviewInput = z.infer<
  typeof getCancelFeePreviewInputSchema
>;

/** 취소 수수료 미리보기 응답 */
export type GetCancelFeePreviewOutput = z.infer<
  typeof getCancelFeePreviewOutputSchema
>;

/** 주문 ID로 클레임 조회 입력 */
export type FindByOrderIdInput = z.infer<typeof findByOrderIdInputSchema>;

/** 주문 ID로 클레임 조회 응답 */
export type FindByOrderIdOutput = z.infer<typeof findByOrderIdOutputSchema>;
