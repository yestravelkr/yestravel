import { z } from 'zod';

// ===== Enum Schemas =====
// Note: 인라인으로 정의 (nestjs-trpc가 import된 상수를 해결하지 못함)

// 취소/반품 요청 상태(CANCEL_REQUESTED, RETURN_REQUESTED)는 Claim.status로 관리
export const orderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
  'COMPLETED',
  'PREPARING_SHIPMENT',
  'SHIPPING',
  'DELIVERED',
  'PURCHASE_CONFIRMED',
  'CANCELLED',
  'RETURNING',
  'RETURNED',
]);

/** 표시용 상태 (Order.status + Claim 기반 합성 상태) */
// Note: orderStatusSchema.options 스프레드 대신 인라인 정의 (nestjs-trpc 코드 생성 호환)
export const displayStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
  'COMPLETED',
  'PREPARING_SHIPMENT',
  'SHIPPING',
  'DELIVERED',
  'PURCHASE_CONFIRMED',
  'CANCELLED',
  'RETURNING',
  'RETURNED',
  'CANCEL_REQUESTED',
  'RETURN_REQUESTED',
]);

export const productTypeSchema = z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']);
export const periodFilterTypeSchema = z.enum([
  'PAYMENT_DATE',
  'ORDER_DATE',
  'USAGE_DATE',
]);

// ===== Input Schemas =====

/**
 * 주문 필터 공통 Schema (상태별 카운트, 목록 조회, 엑셀 내보내기에서 공유)
 */
export const orderFilterSchema = z.object({
  type: productTypeSchema.nullish(),
  status: displayStatusSchema.nullish(),
  periodFilterType: periodFilterTypeSchema.nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  campaignId: z.number().int().positive().nullish(),
  influencerIds: z.array(z.number().int().positive()).nullish(),
  productId: z.number().int().positive().nullish(),
  searchQuery: z.string().nullish(),
});

/**
 * 주문 목록 조회 Input Schema
 */
export const findAllOrdersInputSchema = orderFilterSchema.extend({
  // 페이지네이션
  page: z.number().int().min(1).default(1),
  limit: z.number().int().positive().default(50),
  orderBy: z.string().default('createdAt'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
});

/**
 * 상태별 카운트 조회 Input Schema
 */
export const getStatusCountsInputSchema = orderFilterSchema;

// ===== Output Schemas =====

/**
 * 주문 목록 아이템 Schema
 */
export const orderListItemSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  type: productTypeSchema,
  status: orderStatusSchema,
  displayStatus: displayStatusSchema,
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
  PENDING_RESERVATION: z.number(),
  RESERVATION_CONFIRMED: z.number(),
  COMPLETED: z.number(),
  PREPARING_SHIPMENT: z.number(),
  SHIPPING: z.number(),
  DELIVERED: z.number(),
  PURCHASE_CONFIRMED: z.number(),
  CANCEL_REQUESTED: z.number(),
  RETURN_REQUESTED: z.number(),
  CANCELLED: z.number(),
  RETURNING: z.number(),
  RETURNED: z.number(),
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

// ===== 주문 상세 조회 Schemas =====

/**
 * 주문 상세 조회 Input Schema
 */
export const findByIdInputSchema = z.object({
  id: z.number().int().positive(),
});

/**
 * 주문 상태 변경 Input Schema
 */
export const updateStatusInputSchema = z.object({
  orderId: z.number().int().positive(),
  status: orderStatusSchema,
});

/**
 * 주문 상태 변경 Response Schema
 */
export const updateStatusResponseSchema = z.object({
  success: z.boolean(),
  orderId: z.number(),
  previousStatus: orderStatusSchema,
  newStatus: orderStatusSchema,
});

/**
 * 주문 상세 아이템 Schema (호텔 예약 정보)
 */
export const orderDetailItemSchema = z.object({
  id: z.number(),
  productName: z.string(),
  optionName: z.string(),
  checkInDate: z.string().nullish(),
  checkOutDate: z.string().nullish(),
  amount: z.number(),
});

/**
 * 결제 정보 Schema
 */
export const paymentInfoSchema = z.object({
  paymentMethod: z.string(),
  productAmount: z.number(),
  refundAmount: z.number(),
  totalAmount: z.number(),
  paidAt: z.date().nullish(),
});

/**
 * 회원 정보 Schema
 */
export const memberInfoSchema = z.object({
  name: z.string(),
  phone: z.string(),
});

/**
 * 주문 상세 응답 Schema
 */
export const orderDetailResponseSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  type: productTypeSchema,
  status: orderStatusSchema,
  statusLabel: z.string(),
  statusDate: z.date().nullish(),

  // 캠페인/인플루언서 정보
  campaignId: z.number(),
  campaignName: z.string(),
  influencerId: z.number(),
  influencerName: z.string(),

  // 주문 일시
  orderedAt: z.date(),

  // 주문 아이템 목록
  items: z.array(orderDetailItemSchema),

  // 결제 정보
  payment: paymentInfoSchema,

  // 회원 정보
  member: memberInfoSchema,
});

// ===== 엑셀 내보내기 Schemas =====

/**
 * 엑셀 내보내기 Input Schema
 */
export const exportToExcelInputSchema = orderFilterSchema;

/**
 * 엑셀 내보내기 Response Schema
 */
export const exportToExcelResponseSchema = z.object({
  downloadUrl: z.string(),
  fileName: z.string(),
  totalCount: z.number(),
});
