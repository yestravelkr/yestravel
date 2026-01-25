import type { z } from 'zod';
import type {
  findAllOrdersInputSchema,
  getStatusCountsInputSchema,
  orderListItemSchema,
  orderListResponseSchema,
  statusCountsSchema,
  filterOptionsResponseSchema,
  findByIdInputSchema,
  orderDetailItemSchema,
  paymentInfoSchema,
  memberInfoSchema,
  orderDetailResponseSchema,
} from './order.schema';

// ===== Input DTOs =====

export type FindAllOrdersInput = z.infer<typeof findAllOrdersInputSchema>;

export type GetStatusCountsInput = z.infer<typeof getStatusCountsInputSchema>;

export type FindByIdInput = z.infer<typeof findByIdInputSchema>;

// ===== Output DTOs =====

export type OrderListItem = z.infer<typeof orderListItemSchema>;

export type StatusCounts = z.infer<typeof statusCountsSchema>;

export type OrderListResponse = z.infer<typeof orderListResponseSchema>;

export type FilterOptionsResponse = z.infer<typeof filterOptionsResponseSchema>;

export type OrderDetailItem = z.infer<typeof orderDetailItemSchema>;

export type PaymentInfo = z.infer<typeof paymentInfoSchema>;

export type MemberInfo = z.infer<typeof memberInfoSchema>;

export type OrderDetailResponse = z.infer<typeof orderDetailResponseSchema>;
