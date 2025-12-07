import type { z } from 'zod';
import type {
  campaignSchema,
  createCampaignInputSchema,
  updateCampaignInputSchema,
  findCampaignByIdInputSchema,
  deleteCampaignInputSchema,
  campaignProductInputSchema,
  campaignInfluencerInputSchema,
  campaignInfluencerProductInputSchema,
  campaignInfluencerHotelOptionInputSchema,
} from './campaign.schema';
import type { CampaignProductResponse } from '@src/module/backoffice/domain/campaign-product.entity';
import type { CampaignInfluencerResponse } from '@src/module/backoffice/domain/campaign-influencer.entity';
import type { CampaignInfluencerProductResponse } from '@src/module/backoffice/domain/campaign-influencer-product.entity';
import type { CampaignInfluencerHotelOptionResponse } from '@src/module/backoffice/domain/campaign-influencer-hotel-option.entity';

// Entity에서 정의된 Response 타입 re-export
export type {
  CampaignProductResponse,
  CampaignInfluencerResponse,
  CampaignInfluencerProductResponse,
  CampaignInfluencerHotelOptionResponse,
};

// Zod 스키마에서 추론된 타입들
export type Campaign = z.infer<typeof campaignSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignInputSchema>;
export type FindCampaignByIdInput = z.infer<typeof findCampaignByIdInputSchema>;
export type DeleteCampaignInput = z.infer<typeof deleteCampaignInputSchema>;
export type CampaignProductInput = z.infer<typeof campaignProductInputSchema>;
export type CampaignInfluencerInput = z.infer<
  typeof campaignInfluencerInputSchema
>;
export type CampaignInfluencerProductInput = z.infer<
  typeof campaignInfluencerProductInputSchema
>;
export type CampaignInfluencerHotelOptionInput = z.infer<
  typeof campaignInfluencerHotelOptionInputSchema
>;

// 캠페인 생성 응답 (상품/인플루언서 포함)
export interface CampaignWithRelations extends Campaign {
  products: CampaignProductResponse[];
  influencers: CampaignInfluencerResponse[];
}
