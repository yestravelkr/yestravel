import type { z } from 'zod';
import type {
  createAdditionalPaymentInputSchema,
  createAdditionalPaymentResponseSchema,
  findByOrderIdInputSchema,
  findByOrderIdResponseSchema,
  cancelAdditionalPaymentInputSchema,
  cancelAdditionalPaymentResponseSchema,
  additionalPaymentItemSchema,
  additionalPaymentStatusEnumSchema,
} from './additional-payment.schema';

// ===== Input DTOs =====

export type CreateAdditionalPaymentInput = z.infer<
  typeof createAdditionalPaymentInputSchema
>;

export type FindByOrderIdInput = z.infer<typeof findByOrderIdInputSchema>;

export type CancelAdditionalPaymentInput = z.infer<
  typeof cancelAdditionalPaymentInputSchema
>;

// ===== Output DTOs =====

export type AdditionalPaymentStatus = z.infer<
  typeof additionalPaymentStatusEnumSchema
>;

export type AdditionalPaymentItem = z.infer<typeof additionalPaymentItemSchema>;

export type CreateAdditionalPaymentResponse = z.infer<
  typeof createAdditionalPaymentResponseSchema
>;

export type FindByOrderIdResponse = z.infer<typeof findByOrderIdResponseSchema>;

export type CancelAdditionalPaymentResponse = z.infer<
  typeof cancelAdditionalPaymentResponseSchema
>;
