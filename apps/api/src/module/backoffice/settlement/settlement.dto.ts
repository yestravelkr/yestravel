import { z } from 'zod';
import type {
  findAllSettlementsInputSchema,
  findInfluencerSettlementByIdInputSchema,
  findBrandSettlementByIdInputSchema,
  createInfluencerSettlementInputSchema,
  createBrandSettlementInputSchema,
  completeSettlementsInputSchema,
  exportSettlementToExcelInputSchema,
  settlementListResponseSchema,
  influencerSettlementDetailResponseSchema,
  brandSettlementDetailResponseSchema,
  settlementFilterOptionsResponseSchema,
  createSettlementResponseSchema,
  completeSettlementsResponseSchema,
  exportSettlementToExcelResponseSchema,
} from './settlement.schema';

// ===== Input DTOs =====

export type FindAllSettlementsInput = z.infer<
  typeof findAllSettlementsInputSchema
>;

export type FindInfluencerSettlementByIdInput = z.infer<
  typeof findInfluencerSettlementByIdInputSchema
>;

export type FindBrandSettlementByIdInput = z.infer<
  typeof findBrandSettlementByIdInputSchema
>;

export type CreateInfluencerSettlementInput = z.infer<
  typeof createInfluencerSettlementInputSchema
>;

export type CreateBrandSettlementInput = z.infer<
  typeof createBrandSettlementInputSchema
>;

export type CompleteSettlementsInput = z.infer<
  typeof completeSettlementsInputSchema
>;

export type ExportSettlementToExcelInput = z.infer<
  typeof exportSettlementToExcelInputSchema
>;

// ===== Response DTOs =====

export type SettlementListResponse = z.infer<
  typeof settlementListResponseSchema
>;

export type InfluencerSettlementDetailResponse = z.infer<
  typeof influencerSettlementDetailResponseSchema
>;

export type BrandSettlementDetailResponse = z.infer<
  typeof brandSettlementDetailResponseSchema
>;

export type SettlementFilterOptionsResponse = z.infer<
  typeof settlementFilterOptionsResponseSchema
>;

export type CreateSettlementResponse = z.infer<
  typeof createSettlementResponseSchema
>;

export type CompleteSettlementsResponse = z.infer<
  typeof completeSettlementsResponseSchema
>;

export type ExportSettlementToExcelResponse = z.infer<
  typeof exportSettlementToExcelResponseSchema
>;
