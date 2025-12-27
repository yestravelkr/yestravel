import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  shopProductDetailSchema,
  campaignOtherProductsSchema,
} from './shop.product.schema';

@Router({ alias: 'shopProduct' })
@Injectable()
export class ShopProductRouter extends BaseTrpcRouter {
  /**
   * 상품 상세 조회
   *
   * saleId: CampaignInfluencerProduct.id
   * FE에서 /sale/{saleId} 형태로 접근
   */
  @Query({
    input: z.object({
      saleId: z.number(),
    }),
    output: shopProductDetailSchema,
  })
  async getProductDetail(@Input() input: { saleId: number }) {
    return this.microserviceClient.send('shopProduct.getDetail', input);
  }

  /**
   * 캠페인 다른 상품 조회
   *
   * 현재 상품이 포함된 캠페인의 다른 상품들을 조회합니다.
   * saleId: CampaignInfluencerProduct.id
   */
  @Query({
    input: z.object({
      saleId: z.number(),
    }),
    output: campaignOtherProductsSchema,
  })
  async getCampaignOtherProducts(@Input() input: { saleId: number }) {
    return this.microserviceClient.send(
      'shopProduct.getCampaignOtherProducts',
      input
    );
  }
}
