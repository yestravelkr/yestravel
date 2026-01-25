import { z } from 'zod';
import { ORDER_STATUS_ENUM_VALUE } from '@src/module/backoffice/domain/order/order.entity';
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

// ===== Enum Schemas =====

export const orderStatusSchema = z.enum(ORDER_STATUS_ENUM_VALUE);
export const productTypeSchema = z.enum(PRODUCT_TYPE_ENUM_VALUE);
export const periodFilterTypeSchema = z.enum([
  'PAYMENT_DATE',
  'ORDER_DATE',
  'USAGE_DATE',
]);

// ===== Input Schemas =====

/**
 * 주문 목록 조회 Input Schema
 */
export const findAllOrdersInputSchema = z.object({
  // 페이지네이션
  page: z.number().int().min(1).default(1),
  limit: z.number().int().positive().default(50),
  orderBy: z.string().default('createdAt'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),

  // 필터
  type: productTypeSchema.nullish(),
  status: orderStatusSchema.nullish(),
  periodFilterType: periodFilterTypeSchema.nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  campaignId: z.number().int().positive().nullish(),
  influencerIds: z.array(z.number().int().positive()).nullish(),
  productId: z.number().int().positive().nullish(),
  searchQuery: z.string().nullish(),
});

// ===== Output Schemas =====

/**
 * 주문 목록 아이템 Schema
 */
export const orderListItemSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  type: productTypeSchema,
  status: orderStatusSchema,
  customerName: z.string(),
  customerPhone: z.string(),
  totalAmount: z.number(),

  // 관계 데이터
  productId: z.number(),
  productName: z.string(),
  campaignId: z.number(),
  campaignName: z.string(),
  influencerId: z.number(),
  influencerName: z.string(),

  // 호텔 전용 필드 (nullable)
  checkInDate: z.string().nullish(),
  checkOutDate: z.string().nullish(),
  hotelOptionName: z.string().nullish(),

  // 타임스탬프
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 상태별 카운트 Schema
 */
export const statusCountsSchema = z.object({
  ALL: z.number(),
  PENDING: z.number(),
  PAID: z.number(),
  COMPLETED: z.number(),
  CANCELLED: z.number(),
  REFUNDED: z.number(),
});

/**
 * 주문 목록 응답 Schema
 */
export const orderListResponseSchema = z.object({
  data: z.array(orderListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  statusCounts: statusCountsSchema,
});

/**
 * 필터 옵션 응답 Schema (최근 100개씩)
 */
export const filterOptionsResponseSchema = z.object({
  campaigns: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  influencers: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  products: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
});
