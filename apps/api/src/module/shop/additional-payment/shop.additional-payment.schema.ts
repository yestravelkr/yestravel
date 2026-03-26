import { z } from 'zod';

// ===== getByToken =====

export const shopAdditionalPaymentGetByTokenInputSchema = z.object({
  token: z.string(),
});

export const shopAdditionalPaymentGetByTokenOutputSchema = z.object({
  id: z.number(),
  token: z.string(),
  title: z.string(),
  amount: z.number(),
  reason: z.string(),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'DELETED']),
  expiresAt: z.date(),
  orderId: z.number(),
  orderNumber: z.string(),
  productName: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
});

// ===== complete =====

export const shopAdditionalPaymentCompleteInputSchema = z.object({
  token: z.string(),
  paymentId: z.string(),
  paymentToken: z.string(),
  txId: z.string(),
});

export const shopAdditionalPaymentCompleteOutputSchema = z.object({
  success: z.boolean(),
  orderNumber: z.string(),
});
