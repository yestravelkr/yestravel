import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  shopInfluencerSchema,
  shopCampaignListResponseSchema,
} from './shop.influencer.schema';

@Router({ alias: 'shopInfluencer' })
@Injectable()
export class ShopInfluencerRouter extends BaseTrpcRouter {
  /**
   * slug로 인플루언서 기본 정보 조회
   */
  @Query({
    input: z.object({
      slug: z.string(),
    }),
    output: shopInfluencerSchema,
  })
  async findBySlug(@Input() input: { slug: string }) {
    return this.microserviceClient.send('shopInfluencer.findBySlug', input);
  }

  /**
   * 인플루언서의 진행 중인 캠페인 목록 조회
   */
  @Query({
    input: z.object({
      slug: z.string(),
    }),
    output: shopCampaignListResponseSchema,
  })
  async getCampaigns(@Input() input: { slug: string }) {
    return this.microserviceClient.send('shopInfluencer.getCampaigns', input);
  }
}
