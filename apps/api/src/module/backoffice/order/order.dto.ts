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
  updateStatusInputSchema,
  updateStatusResponseSchema,
  revertStatusInputSchema,
  revertStatusResponseSchema,
  exportToExcelInputSchema,
  exportToExcelResponseSchema,
  cancelOrderInputSchema,
  cancelOrderResponseSchema,
  getHistoryInputSchema,
  orderHistoryItemSchema,
  getHistoryResponseSchema,
} from './order.schema';
import type { AuthType } from '../auth/backoffice.auth.service';

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

export type UpdateStatusInput = z.infer<typeof updateStatusInputSchema>;

export type UpdateStatusResponse = z.infer<typeof updateStatusResponseSchema>;

export type RevertStatusInput = z.infer<typeof revertStatusInputSchema>;

export type RevertStatusResponse = z.infer<typeof revertStatusResponseSchema>;

export type ExportToExcelInput = z.infer<typeof exportToExcelInputSchema>;

export type ExportToExcelResponse = z.infer<typeof exportToExcelResponseSchema>;

export type CancelOrderInput = z.infer<typeof cancelOrderInputSchema>;

export type CancelOrderResponse = z.infer<typeof cancelOrderResponseSchema>;

export type GetHistoryInput = z.infer<typeof getHistoryInputSchema>;

export type OrderHistoryItem = z.infer<typeof orderHistoryItemSchema>;

export type GetHistoryResponse = z.infer<typeof getHistoryResponseSchema>;

// ===== Partner Scope =====

export type PartnerScope = {
  authType: AuthType;
  partnerId?: number;
};
