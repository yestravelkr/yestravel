import type { z } from 'zod';
import type {
  createClaimInputSchema,
  createClaimOutputSchema,
  getClaimByOrderIdInputSchema,
  getClaimByOrderIdOutputSchema,
  claimDetailSchema,
  withdrawClaimInputSchema,
  withdrawClaimOutputSchema,
} from './shop.claim.schema';

// ===== Create Claim =====

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

// ===== Withdraw Claim =====

export type WithdrawClaimInput = z.infer<typeof withdrawClaimInputSchema> & {
  memberId: number;
};

export type WithdrawClaimOutput = z.infer<typeof withdrawClaimOutputSchema>;
