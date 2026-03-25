import { z } from 'zod';

// ===== Input Schemas =====

/**
 * 추가결제 생성 Input Schema
 */
export const createAdditionalPaymentInputSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().int().min(1000),
  title: z.string().min(1).max(200),
  reason: z.string().min(1).max(500),
});

/**
 * 주문별 추가결제 목록 조회 Input Schema
 */
export const findByOrderIdInputSchema = z.object({
  orderId: z.number().int().positive(),
});

/**
 * 추가결제 무효화 Input Schema
 */
export const cancelAdditionalPaymentInputSchema = z.object({
  additionalPaymentId: z.number().int().positive(),
});

// ===== Output Schemas =====

/**
 * 추가결제 상태 Schema
 */
export const additionalPaymentStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'EXPIRED',
  'DELETED',
]);

/**
 * 추가결제 생성 Response Schema
 */
export const createAdditionalPaymentResponseSchema = z.object({
  additionalPaymentId: z.number(),
  paymentUrl: z.string(),
});

/**
 * 추가결제 목록 아이템 Schema
 */
export const additionalPaymentItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  amount: z.number(),
  reason: z.string(),
  status: additionalPaymentStatusSchema,
  paymentUrl: z.string().nullish(),
  expiresAt: z.date(),
  createdAt: z.date(),
  paidAt: z.date().nullish(),
});

/**
 * 주문별 추가결제 목록 Response Schema
 */
export const findByOrderIdResponseSchema = z.array(additionalPaymentItemSchema);

/**
 * 추가결제 무효화 Response Schema
 */
export const cancelAdditionalPaymentResponseSchema = z.object({
  success: z.boolean(),
  additionalPaymentId: z.number(),
});
