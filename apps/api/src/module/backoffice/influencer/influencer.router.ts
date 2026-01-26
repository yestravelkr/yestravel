import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  BackofficeAuthMiddleware,
  BackofficeAuthorizedContext,
} from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { z } from 'zod';
import {
  influencerSchema,
  socialMediaPlatformEnumSchema,
} from './influencer.schema';
import { BUSINESS_TYPE_ENUM_VALUE } from '@src/module/backoffice/brand/brand.schema';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
} from './influencer.dto';

// Inline schemas for Router (Router 규칙: 외부 스키마 import 금지, 인라인 정의 필수)
const businessTypeEnumSchema = z.enum(BUSINESS_TYPE_ENUM_VALUE);
const businessInfoInlineSchema = z.object({
  type: businessTypeEnumSchema.nullish(),
  name: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  ceoName: z.string().nullish(),
  licenseFileUrl: z.string().nullish(),
});
const bankInfoInlineSchema = z.object({
  name: z.string().nullish(),
  accountNumber: z.string().nullish(),
  accountHolder: z.string().nullish(),
});

@Router({ alias: 'backofficeInfluencer' })
export class InfluencerRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
      ids: z.array(z.number().int().positive()).nullish(),
    }),
    output: z.object({
      data: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          slug: z.string(),
          email: z.string().nullish(),
          phoneNumber: z.string().nullish(),
          thumbnail: z.string().nullish(),
          createdAt: z.date(),
        })
      ),
      total: z.number(),
    }),
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: { page: number; limit: number; ids?: number[] }
  ) {
    const output = await this.microserviceClient.send(
      'influencer.findAll',
      input
    );
    return output;
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      name: z.string().min(1, '인플루언서명은 필수입니다'),
      slug: z
        .string()
        .min(1, '샵 URL은 필수입니다')
        .max(50, '샵 URL은 50자 이내로 입력해주세요')
        .regex(
          /^[a-z0-9_-]+$/,
          '샵 URL은 영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
        ),
      email: z.string().email('유효한 이메일을 입력해주세요').nullish(),
      phoneNumber: z.string().nullish(),
      thumbnail: z.string().nullish(),
      businessInfo: businessInfoInlineSchema.nullish(),
      bankInfo: bankInfoInlineSchema.nullish(),
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
  @Query({
    input: z.object({
      id: z.number(),
    }),
    output: influencerSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: { id: number }
  ) {
    const output = await this.microserviceClient.send(
      'influencer.findById',
      input
    );
    return influencerSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.number(),
      name: z.string().min(1, '인플루언서명은 필수입니다'),
      slug: z
        .string()
        .min(1, '샵 URL은 필수입니다')
        .max(50, '샵 URL은 50자 이내로 입력해주세요')
        .regex(
          /^[a-z0-9_-]+$/,
          '샵 URL은 영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
        ),
      email: z.string().email('유효한 이메일을 입력해주세요').nullish(),
      phoneNumber: z.string().nullish(),
      thumbnail: z.string().nullish(),
      businessInfo: businessInfoInlineSchema.nullish(),
      bankInfo: bankInfoInlineSchema.nullish(),
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
