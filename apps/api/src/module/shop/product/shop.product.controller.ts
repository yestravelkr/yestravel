import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopProductService } from './shop.product.service';
import {
  shopProductDetailSchema,
  campaignOtherProductsSchema,
  influencerOtherCampaignsSchema,
} from './shop.product.schema';
import type {
  GetProductDetailInput,
  ProductDetailResponse,
  GetCampaignOtherProductsInput,
  CampaignOtherProductsResponse,
  GetInfluencerOtherCampaignsInput,
  InfluencerOtherCampaignsResponse,
} from './shop.product.dto';

@Controller()
export class ShopProductController {
  constructor(private readonly shopProductService: ShopProductService) {}

  @MessagePattern('shopProduct.getDetail')
  async getDetail(
    input: GetProductDetailInput
  ): Promise<ProductDetailResponse> {
    const result = await this.shopProductService.getProductDetail(input);
    return shopProductDetailSchema.parse(result);
  }

  @MessagePattern('shopProduct.getCampaignOtherProducts')
  async getCampaignOtherProducts(
    input: GetCampaignOtherProductsInput
  ): Promise<CampaignOtherProductsResponse> {
    const result =
      await this.shopProductService.getCampaignOtherProducts(input);
    return campaignOtherProductsSchema.parse(result);
  }

  @MessagePattern('shopProduct.getInfluencerOtherCampaigns')
  async getInfluencerOtherCampaigns(
    input: GetInfluencerOtherCampaignsInput
  ): Promise<InfluencerOtherCampaignsResponse> {
    const result =
      await this.shopProductService.getInfluencerOtherCampaigns(input);
    return influencerOtherCampaignsSchema.parse(result);
  }
}
