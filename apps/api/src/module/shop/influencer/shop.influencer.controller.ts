import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopInfluencerService } from './shop.influencer.service';
import {
  shopInfluencerSchema,
  shopCampaignListResponseSchema,
  shopCampaignDetailResponseSchema,
} from './shop.influencer.schema';
import type {
  FindBySlugInput,
  GetCampaignsInput,
  GetCampaignDetailInput,
  ShopInfluencerResponse,
  ShopCampaignListResponse,
  ShopCampaignDetailResponse,
} from './shop.influencer.dto';

@Controller()
export class ShopInfluencerController {
  constructor(private readonly shopInfluencerService: ShopInfluencerService) {}

  @MessagePattern('shopInfluencer.findBySlug')
  async findBySlug(input: FindBySlugInput): Promise<ShopInfluencerResponse> {
    const result = await this.shopInfluencerService.findBySlug(input.slug);
    return shopInfluencerSchema.parse(result);
  }

  @MessagePattern('shopInfluencer.getCampaigns')
  async getCampaigns(
    input: GetCampaignsInput
  ): Promise<ShopCampaignListResponse> {
    const result = await this.shopInfluencerService.getCampaigns(input.slug);
    return shopCampaignListResponseSchema.parse(result);
  }

  @MessagePattern('shopInfluencer.getCampaignDetail')
  async getCampaignDetail(
    input: GetCampaignDetailInput
  ): Promise<ShopCampaignDetailResponse> {
    const result = await this.shopInfluencerService.getCampaignDetail(
      input.slug,
      input.campaignId
    );
    return shopCampaignDetailResponseSchema.parse(result);
  }
}
