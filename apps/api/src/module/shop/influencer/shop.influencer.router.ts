import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  shopInfluencerSchema,
  shopCampaignListResponseSchema,
  shopCampaignDetailResponseSchema,
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

  /**
   * 캠페인 상세 정보 조회
   * - 캠페인 정보: 이름, 기간
   * - 상품 리스트: 썸네일, 이름, 원가, 할인가
   */
  @Query({
    input: z.object({
      slug: z.string(),
      campaignId: z.number(),
    }),
    output: shopCampaignDetailResponseSchema,
  })
  async getCampaignDetail(
    @Input() input: { slug: string; campaignId: number }
  ) {
    return this.microserviceClient.send(
      'shopInfluencer.getCampaignDetail',
      input
    );
  }
}
