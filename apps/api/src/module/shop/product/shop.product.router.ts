import { Router, Query, Mutation, Ctx, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import {BaseTrpcRouter} from "@src/module/trpc/baseTrpcRouter";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";
import { shopProductDetailSchema } from './shop.product.schema';

@Router({ alias: 'shopProduct' })
@Injectable()
export class ShopProductRouter extends BaseTrpcRouter {

  @Query({
    input: z.object({
      influencerProductId: z.string().min(1),
    }),
    output: shopProductDetailSchema,
  })
  async getProductDetail(@Input() input: { influencerProductId: string }) {
    return this.microserviceClient.send('shopProduct.getDetail', input);
  }

  // TODO: 상품 목록 조회 엔드포인트 추가 예정
  // TODO: 상품 검색 엔드포인트 추가 예정
}
