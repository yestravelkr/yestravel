import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopInfluencerService } from './shop.influencer.service';
import {
  shopInfluencerSchema,
  shopCampaignListResponseSchema,
} from './shop.influencer.schema';
import type {
  FindBySlugInput,
  GetCampaignsInput,
  ShopInfluencerResponse,
  ShopCampaignListResponse,
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
}
