import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  BackofficeAuthMiddleware,
  BackofficeAuthorizedContext,
} from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { z } from 'zod';
import {
  influencerSchema,
  socialMediaPlatformEnumSchema,
  businessInfoSchema,
  bankInfoSchema,
} from './influencer.schema';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
} from './influencer.dto';

@Router({ alias: 'backofficeInfluencer' })
export class InfluencerRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      name: z.string().min(1, '인플루언서명은 필수입니다'),
      email: z.string().email('유효한 이메일을 입력해주세요').nullish(),
      phoneNumber: z.string().nullish(),
      thumbnail: z.string().nullish(),
      businessInfo: businessInfoSchema.nullish(),
      bankInfo: bankInfoSchema.nullish(),
      socialMedias: z
        .array(
          z.object({
            platform: socialMediaPlatformEnumSchema,
            url: z.string().url('유효한 URL을 입력해주세요'),
          })
        )
        .min(1, '최소 1개 이상의 소셜미디어가 필요합니다'),
    }),
    output: influencerSchema,
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateInfluencerInput
  ) {
    const output = await this.microserviceClient.send(
      'influencer.create',
      input
    );
    return influencerSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.number(),
      name: z.string().min(1, '인플루언서명은 필수입니다'),
      email: z.string().email('유효한 이메일을 입력해주세요').nullish(),
      phoneNumber: z.string().nullish(),
      thumbnail: z.string().nullish(),
      businessInfo: businessInfoSchema.nullish(),
      bankInfo: bankInfoSchema.nullish(),
      socialMedias: z
        .array(
          z.object({
            platform: socialMediaPlatformEnumSchema,
            url: z.string().url('유효한 URL을 입력해주세요'),
          })
        )
        .min(1, '최소 1개 이상의 소셜미디어가 필요합니다'),
    }),
    output: influencerSchema,
  })
  async update(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateInfluencerInput
  ) {
    const output = await this.microserviceClient.send(
      'influencer.update',
      input
    );
    return influencerSchema.parse(output);
  }
}
