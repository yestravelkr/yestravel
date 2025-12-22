/**
 * Shop Influencer DTO
 *
 * B2C 고객용 인플루언서 관련 DTO 정의
 */

export interface FindBySlugInput {
  slug: string;
}

export interface ShopInfluencerResponse {
  id: number;
  slug: string;
  name: string;
  thumbnail: string | null;
}

export interface GetCampaignsInput {
  slug: string;
}

export interface ShopCampaignProductResponse {
  id: number;
  saleId: number;
  name: string;
  thumbnail: string | null;
}

export interface ShopCampaignListItemResponse {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date;
  products: ShopCampaignProductResponse[];
}

export interface ShopCampaignListResponse {
  campaigns: ShopCampaignListItemResponse[];
}
