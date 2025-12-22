import { z } from 'zod';

/**
 * Shop Influencer Schema
 *
 * B2C 고객용 인플루언서 관련 Zod 스키마 정의
 */

// 인플루언서 기본 정보 스키마
export const shopInfluencerSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  thumbnail: z.string().nullable(),
});

export type ShopInfluencer = z.infer<typeof shopInfluencerSchema>;

// 캠페인 내 상품 정보 스키마
export const shopCampaignProductSchema = z.object({
  id: z.number(),
  saleId: z.number(),
  name: z.string(),
  thumbnail: z.string().nullable(),
});

export type ShopCampaignProduct = z.infer<typeof shopCampaignProductSchema>;

// 캠페인 리스트 아이템 스키마
export const shopCampaignListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  products: z.array(shopCampaignProductSchema),
});

export type ShopCampaignListItem = z.infer<typeof shopCampaignListItemSchema>;

// 캠페인 리스트 응답 스키마
export const shopCampaignListResponseSchema = z.object({
  campaigns: z.array(shopCampaignListItemSchema),
});

export type ShopCampaignListResponse = z.infer<
  typeof shopCampaignListResponseSchema
>;

// 캠페인 상세 - 상품 정보 스키마 (가격 정보 포함)
export const shopCampaignDetailProductSchema = z.object({
  id: z.number(),
  saleId: z.number(),
  name: z.string(),
  thumbnail: z.string().nullable(),
  originalPrice: z.number(),
  price: z.number(),
});

export type ShopCampaignDetailProduct = z.infer<
  typeof shopCampaignDetailProductSchema
>;

// 캠페인 상세 응답 스키마
export const shopCampaignDetailResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  products: z.array(shopCampaignDetailProductSchema),
});

export type ShopCampaignDetailResponse = z.infer<
  typeof shopCampaignDetailResponseSchema
>;
