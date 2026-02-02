/**
 * Claim DTO - 클레임 관련 DTO
 */

import type { z } from 'zod';
import type {
  approveClaimInputSchema,
  approveClaimResponseSchema,
  rejectClaimInputSchema,
  rejectClaimResponseSchema,
} from './claim.schema';

/** 취소 승인 입력 */
export type ApproveClaimInput = z.infer<typeof approveClaimInputSchema>;

/** 취소 승인 응답 */
export type ApproveClaimResponse = z.infer<typeof approveClaimResponseSchema>;

/** 취소 거절 입력 */
export type RejectClaimInput = z.infer<typeof rejectClaimInputSchema>;

/** 취소 거절 응답 */
export type RejectClaimResponse = z.infer<typeof rejectClaimResponseSchema>;
