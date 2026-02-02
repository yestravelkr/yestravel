/**
 * Claim DTO - 클레임 관련 DTO
 */

import type { z } from 'zod';
import type {
  rejectClaimInputSchema,
  rejectClaimResponseSchema,
} from './claim.schema';

/** 취소 거절 입력 */
export type RejectClaimInput = z.infer<typeof rejectClaimInputSchema>;

/** 취소 거절 응답 */
export type RejectClaimResponse = z.infer<typeof rejectClaimResponseSchema>;
