import { z } from 'zod';

// ===== Enum Schemas =====

export const settlementStatusSchema = z.enum(['PENDING', 'COMPLETED']);
export const settlementTargetTypeSchema = z.enum(['INFLUENCER', 'BRAND']);

// ===== Input Schemas =====

/**
 * 정산 목록 조회 Input Schema
 */
export const findAllSettlementsInputSchema = z.object({
  status: settlementStatusSchema.nullish(),
  targetType: settlementTargetTypeSchema.nullish(),
  campaignId: z.number().int().positive().nullish(),
  targetId: z.number().int().positive().nullish(),
  periodYear: z.number().int().positive().nullish(),
  periodMonth: z.number().int().min(1).max(12).nullish(),
  // 페이지네이션
  page: z.number().int().min(1).default(1),
  limit: z.number().int().positive().default(50),
});

/**
 * 인플루언서 정산 상세 조회 Input Schema
 */
export const findInfluencerSettlementByIdInputSchema = z.object({
  id: z.number().int().positive(),
});

/**
 * 브랜드 정산 상세 조회 Input Schema
 */
export const findBrandSettlementByIdInputSchema = z.object({
  id: z.number().int().positive(),
});

/**
 * 인플루언서 정산 생성 Input Schema
 */
export const createInfluencerSettlementInputSchema = z.object({
  influencerId: z.number().int().positive(),
  periodYear: z.number().int().positive(),
  periodMonth: z.number().int().min(1).max(12),
  scheduledAt: z.string(),
});

/**
 * 브랜드 정산 생성 Input Schema
 */
export const createBrandSettlementInputSchema = z.object({
  brandId: z.number().int().positive(),
  periodYear: z.number().int().positive(),
  periodMonth: z.number().int().min(1).max(12),
  scheduledAt: z.string(),
});

/**
 * 정산 완료 처리 Input Schema
 */
export const completeSettlementsInputSchema = z.object({
  ids: z.array(z.number().int().positive()),
});

/**
 * 엑셀 내보내기 Input Schema
 */
export const exportSettlementToExcelInputSchema = z.object({
  settlementId: z.number().int().positive(),
  targetType: settlementTargetTypeSchema,
});

// ===== Output Schemas =====

/**
 * 정산 목록 아이템 Schema
 */
export const settlementListItemSchema = z.object({
  id: z.number(),
  targetType: settlementTargetTypeSchema,
  targetId: z.number(),
  targetName: z.string(),
  periodYear: z.number(),
  periodMonth: z.number(),
  status: settlementStatusSchema,
  scheduledAt: z.date(),
  completedAt: z.date().nullish(),
  totalSales: z.number(),
  totalQuantity: z.number(),
  totalAmount: z.number(),
  campaignNames: z.array(z.string()),
  createdAt: z.date(),
});

/**
 * 정산 목록 응답 Schema
 */
export const settlementListResponseSchema = z.object({
  data: z.array(settlementListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

/**
 * 상품별 정산 상세 Schema
 */
export const settlementProductDetailSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  optionName: z.string().nullish(),
  quantity: z.number(),
  sales: z.number(),
  settlementAmount: z.number(),
});

/**
 * 캠페인별 정산 그룹 Schema
 */
export const settlementCampaignGroupSchema = z.object({
  campaignId: z.number(),
  campaignName: z.string(),
  campaignPeriod: z.string(),
  products: z.array(settlementProductDetailSchema),
  subtotalQuantity: z.number(),
  subtotalSales: z.number(),
  subtotalAmount: z.number(),
});

/**
 * 계좌 정보 Schema
 */
export const bankAccountSchema = z.object({
  bankName: z.string().nullish(),
  accountNumber: z.string().nullish(),
  accountHolder: z.string().nullish(),
});

/**
 * 인플루언서 정산 상세 응답 Schema
 */
export const influencerSettlementDetailResponseSchema = z.object({
  id: z.number(),
  influencerId: z.number(),
  influencerName: z.string(),
  periodYear: z.number(),
  periodMonth: z.number(),
  status: settlementStatusSchema,
  scheduledAt: z.date(),
  completedAt: z.date().nullish(),
  totalSales: z.number(),
  totalQuantity: z.number(),
  totalAmount: z.number(),
  campaignGroups: z.array(settlementCampaignGroupSchema),
  bankAccount: bankAccountSchema,
});

/**
 * 브랜드 정산 상세 응답 Schema
 */
export const brandSettlementDetailResponseSchema = z.object({
  id: z.number(),
  brandId: z.number(),
  brandName: z.string(),
  periodYear: z.number(),
  periodMonth: z.number(),
  status: settlementStatusSchema,
  scheduledAt: z.date(),
  completedAt: z.date().nullish(),
  totalSales: z.number(),
  totalQuantity: z.number(),
  totalAmount: z.number(),
  campaignGroups: z.array(settlementCampaignGroupSchema),
  bankAccount: bankAccountSchema,
});

/**
 * 필터 옵션 응답 Schema
 */
export const settlementFilterOptionsResponseSchema = z.object({
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
  brands: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  periods: z.array(
    z.object({
      year: z.number(),
      month: z.number(),
      label: z.string(),
    })
  ),
});

/**
 * 정산 생성 응답 Schema
 */
export const createSettlementResponseSchema = z.object({
  id: z.number(),
  success: z.boolean(),
});

/**
 * 정산 완료 응답 Schema
 */
export const completeSettlementsResponseSchema = z.object({
  success: z.boolean(),
  completedCount: z.number(),
});

/**
 * 엑셀 내보내기 응답 Schema
 */
export const exportSettlementToExcelResponseSchema = z.object({
  downloadUrl: z.string(),
  fileName: z.string(),
});
