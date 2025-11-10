import { z } from 'zod';

export const shopPaymentCompleteInputSchema = z.object({
  paymentId: z.string(),
  paymentToken: z.string(),
  transactionType: z.string(),
  txId: z.string(),
});

export const shopPaymentCompleteOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
