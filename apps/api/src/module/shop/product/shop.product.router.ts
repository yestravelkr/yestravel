import { Router, Query, Input } from 'nestjs-trpc-v2';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { shopProductDetailSchema } from './shop.product.schema';

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
}
