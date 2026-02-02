import type { z } from 'zod';
import type {
  createClaimInputSchema,
  createClaimOutputSchema,
  getClaimByOrderIdInputSchema,
  getClaimByOrderIdOutputSchema,
  claimDetailSchema,
} from './shop.claim.schema';

// ===== Create Claim =====

/**
 * TODO: 부분 옵션 반품 지원 시 추가 필요
 * returnItems?: { optionId: number; quantity: number; }[]
 */
export type CreateClaimInput = z.infer<typeof createClaimInputSchema> & {
  memberId: number;
};

export type CreateClaimOutput = z.infer<typeof createClaimOutputSchema>;

// ===== Get Claim by Order ID =====

export type GetClaimByOrderIdInput = z.infer<
  typeof getClaimByOrderIdInputSchema
> & {
  memberId: number;
};

export type GetClaimByOrderIdOutput = z.infer<
  typeof getClaimByOrderIdOutputSchema
>;

export type ClaimDetail = z.infer<typeof claimDetailSchema>;
