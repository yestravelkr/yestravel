import { z } from 'zod';
import { EnumType } from '@src/types/utility.type';

// Campaign Period Type Enum - 인플루언서 참여 기간 타입
export const CAMPAIGN_PERIOD_TYPE_ENUM_VALUE = ['DEFAULT', 'CUSTOM'] as const;
export type CampaignPeriodTypeEnumType =
  (typeof CAMPAIGN_PERIOD_TYPE_ENUM_VALUE)[number];
export const CampaignPeriodTypeEnum: EnumType<CampaignPeriodTypeEnumType> = {
  DEFAULT: 'DEFAULT',
  CUSTOM: 'CUSTOM',
};
export const campaignPeriodTypeEnumSchema = z.enum(
  CAMPAIGN_PERIOD_TYPE_ENUM_VALUE
);

// Campaign Fee Type Enum - 인플루언서 진행비 타입
export const CAMPAIGN_FEE_TYPE_ENUM_VALUE = ['NONE', 'CUSTOM'] as const;
export type CampaignFeeTypeEnumType =
  (typeof CAMPAIGN_FEE_TYPE_ENUM_VALUE)[number];
export const CampaignFeeTypeEnum: EnumType<CampaignFeeTypeEnumType> = {
  NONE: 'NONE',
  CUSTOM: 'CUSTOM',
};
export const campaignFeeTypeEnumSchema = z.enum(CAMPAIGN_FEE_TYPE_ENUM_VALUE);

// Campaign Status Enum - 캠페인 내 상품/인플루언서 상태 (기존 PRODUCT_STATUS와 동일)
export const CAMPAIGN_STATUS_ENUM_VALUE = [
  'VISIBLE',
  'HIDDEN',
  'SOLD_OUT',
] as const;
export type CampaignStatusEnumType =
  (typeof CAMPAIGN_STATUS_ENUM_VALUE)[number];
export const CampaignStatusEnum: EnumType<CampaignStatusEnumType> = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
  SOLD_OUT: 'SOLD_OUT',
};
export const campaignStatusEnumSchema = z.enum(CAMPAIGN_STATUS_ENUM_VALUE);

// Main campaign schema
export const campaignSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// CampaignProduct Input Schema
export const campaignProductInputSchema = z.object({
  productId: z.number(),
  status: campaignStatusEnumSchema.default('VISIBLE'),
});

// CampaignInfluencerHotelOption Input Schema - 호텔 옵션별 수수료
export const campaignInfluencerHotelOptionInputSchema = z.object({
  hotelOptionId: z.number(),
  commissionByDate: z.record(z.string(), z.number()).default({}),
});

// CampaignInfluencerProduct Input Schema - 인플루언서별 상품 설정
export const campaignInfluencerProductInputSchema = z.object({
  productId: z.number(),
  useCustomCommission: z.boolean().default(false),
  hotelOptions: z.array(campaignInfluencerHotelOptionInputSchema).default([]),
});

// CampaignInfluencer Input Schema
export const campaignInfluencerInputSchema = z.object({
  influencerId: z.number(),
  periodType: campaignPeriodTypeEnumSchema.default('DEFAULT'),
  startAt: z.coerce.date().nullish(), // CUSTOM일 때만 사용
  endAt: z.coerce.date().nullish(), // CUSTOM일 때만 사용
  feeType: campaignFeeTypeEnumSchema.default('NONE'),
  fee: z.number().nullish(), // CUSTOM일 때만 사용
  status: campaignStatusEnumSchema.default('VISIBLE'),
  // 인플루언서별 상품 설정 (선택)
  products: z.array(campaignInfluencerProductInputSchema).default([]),
});

// Input schemas
export const createCampaignInputSchema = z.object({
  title: z.string().min(1, '캠페인명은 필수입니다'),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
  // 상품 목록 (선택)
  products: z.array(campaignProductInputSchema).default([]),
  // 인플루언서 목록 (선택)
  influencers: z.array(campaignInfluencerInputSchema).default([]),
});

export const updateCampaignInputSchema = createCampaignInputSchema.extend({
  id: z.number(),
});

export const findCampaignByIdInputSchema = z.object({
  id: z.number(),
});

export const deleteCampaignInputSchema = z.object({
  id: z.number(),
});

// Response schemas
export const campaignProductResponseSchema = z.object({
  // Product 정보 (flat)
  id: z.number(),
  name: z.string(),
  brand: z.object({
    id: z.number(),
    name: z.string(),
  }),
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
  // CampaignProduct 메타데이터
  campaignProductId: z.number(),
  status: campaignStatusEnumSchema,
});

// CampaignInfluencerHotelOption Response Schema
export const campaignInfluencerHotelOptionResponseSchema = z.object({
  campaignInfluencerHotelOptionId: z.number(),
  hotelOptionId: z.number(),
  commissionByDate: z.record(z.string(), z.number()),
});

// CampaignInfluencerProduct Response Schema
export const campaignInfluencerProductResponseSchema = z.object({
  campaignInfluencerProductId: z.number(),
  productId: z.number(),
  useCustomCommission: z.boolean(),
  hotelOptions: z.array(campaignInfluencerHotelOptionResponseSchema),
});

export const campaignInfluencerResponseSchema = z.object({
  campaignInfluencerId: z.string(), // composite key: `${campaignId}_${influencerId}`
  influencerId: z.number(),
  periodType: campaignPeriodTypeEnumSchema,
  startAt: z.date().nullable(),
  endAt: z.date().nullable(),
  feeType: campaignFeeTypeEnumSchema,
  fee: z.number().nullable(),
  status: campaignStatusEnumSchema,
  // 인플루언서별 상품 목록
  products: z.array(campaignInfluencerProductResponseSchema),
});

// 캠페인 상세 응답 (상품/인플루언서 포함)
export const campaignWithRelationsSchema = campaignSchema.extend({
  products: z.array(campaignProductResponseSchema),
  influencers: z.array(campaignInfluencerResponseSchema),
});
