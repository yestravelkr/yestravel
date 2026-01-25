import type { z } from 'zod';
import type {
  findAllOrdersInputSchema,
  getStatusCountsInputSchema,
  orderListItemSchema,
  orderListResponseSchema,
  statusCountsSchema,
  filterOptionsResponseSchema,
} from './order.schema';

// ===== Input DTOs =====

export type FindAllOrdersInput = z.infer<typeof findAllOrdersInputSchema>;

export type GetStatusCountsInput = z.infer<typeof getStatusCountsInputSchema>;

// ===== Output DTOs =====

export type OrderListItem = z.infer<typeof orderListItemSchema>;

export type StatusCounts = z.infer<typeof statusCountsSchema>;

export type OrderListResponse = z.infer<typeof orderListResponseSchema>;

export type FilterOptionsResponse = z.infer<typeof filterOptionsResponseSchema>;
