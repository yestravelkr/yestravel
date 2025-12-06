import { z } from 'zod';

// Campaign Period Type Enum
export const CAMPAIGN_PERIOD_TYPE_ENUM_VALUE = ['DEFAULT', 'CUSTOM'] as const;
export const campaignPeriodTypeEnumSchema = z.enum(CAMPAIGN_PERIOD_TYPE_ENUM_VALUE);

// Campaign Fee Type Enum
export const CAMPAIGN_FEE_TYPE_ENUM_VALUE = ['NONE', 'CUSTOM'] as const;
export const campaignFeeTypeEnumSchema = z.enum(CAMPAIGN_FEE_TYPE_ENUM_VALUE);

// Campaign Status Enum
export const CAMPAIGN_STATUS_ENUM_VALUE = ['VISIBLE', 'HIDDEN', 'SOLD_OUT'] as const;
export const campaignStatusEnumSchema = z.enum(CAMPAIGN_STATUS_ENUM_VALUE);

// CampaignProduct Input Schema
export const campaignProductInputSchema = z.object({
  productId: z.number(),
  status: campaignStatusEnumSchema.default('VISIBLE'),
});

// CampaignHotelOption Input Schema
export const campaignHotelOptionInputSchema = z.object({
  hotelOptionId: z.number(),
  commissionByDate: z.record(z.string(), z.number()).default({}),
});

// CampaignInfluencerProduct Input Schema
export const campaignInfluencerProductInputSchema = z.object({
  productId: z.number(),
  useCustomCommission: z.boolean().default(false),
  hotelOptions: z.array(campaignHotelOptionInputSchema).default([]),
});

// CampaignInfluencer Input Schema
export const campaignInfluencerInputSchema = z.object({
  influencerId: z.number(),
  periodType: campaignPeriodTypeEnumSchema.default('DEFAULT'),
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
  feeType: campaignFeeTypeEnumSchema.default('NONE'),
  fee: z.number().nullish(),
  status: campaignStatusEnumSchema.default('VISIBLE'),
  products: z.array(campaignInfluencerProductInputSchema).default([]),
});