import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  Router,
  Query,
  Mutation,
  Ctx,
  Input,
  UseMiddlewares,
} from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  findAllProductTemplateQuerySchema,
  productTemplateListItemSchema,
} from './product-template.schema';
import { createPaginatedResponseSchema } from '@src/module/shared/schema/pagination.schema';
import {
  normalizeTime,
  TIME_FORMAT_REGEX,
} from '@src/utils/time.util';

@Router({ alias: 'backofficeProductTemplate' })
export class ProductTemplateRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllProductTemplateQuerySchema.optional().default({}),
    output: createPaginatedResponseSchema(productTemplateListItemSchema),
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input()
    input?: z.infer<typeof findAllProductTemplateQuerySchema>
  ) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.findAll',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
    }),
    output: z.discriminatedUnion('type', [
      // Hotel Detail
      z.object({
        type: z.literal('HOTEL'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        baseCapacity: z.number(),
        maxCapacity: z.number(),
        checkInTime: z.string(),
        checkOutTime: z.string(),
        bedTypes: z.array(z.string()),
        tags: z.array(z.string()),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      // Delivery Detail
      z.object({
        type: z.literal('DELIVERY'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        delivery: z.object({
          deliveryFeeType: z.string(),
          deliveryFee: z.number(),
          freeDeliveryMinAmount: z.number(),
          returnDeliveryFee: z.number(),
          exchangeDeliveryFee: z.number(),
          remoteAreaExtraFee: z.number(),
          jejuExtraFee: z.number(),
          isJejuRestricted: z.boolean(),
          isRemoteIslandRestricted: z.boolean(),
        }),
        exchangeReturnInfo: z.string(),
        productInfoNotice: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      // ETicket Detail
      z.object({
        type: z.literal('E-TICKET'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brand: z.object({
          id: z.number(),
          name: z.string(),
        }),
        categories: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
          })
        ),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ]),
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: { id: number }
  ) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.findById',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.discriminatedUnion('type', [
      // Hotel Template
      z.object({
        type: z.literal('HOTEL'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        baseCapacity: z
          .number()
          .int()
          .positive('기준인원은 1명 이상이어야 합니다'),
        maxCapacity: z
          .number()
          .int()
          .positive('최대인원은 1명 이상이어야 합니다'),
        checkInTime: z
          .string()
          .regex(TIME_FORMAT_REGEX)
          .transform(normalizeTime),
        checkOutTime: z
          .string()
          .regex(TIME_FORMAT_REGEX)
          .transform(normalizeTime),
        bedTypes: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
      }),
      // Delivery Template
      z.object({
        type: z.literal('DELIVERY'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        delivery: z.object({
          deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
          deliveryFee: z.number().int().nonnegative().default(0),
          freeDeliveryMinAmount: z.number().int().nonnegative().default(0),
          returnDeliveryFee: z.number().int().nonnegative().default(0),
          exchangeDeliveryFee: z.number().int().nonnegative().default(0),
          remoteAreaExtraFee: z.number().int().nonnegative().default(0),
          jejuExtraFee: z.number().int().nonnegative().default(0),
          isJejuRestricted: z.boolean().default(false),
          isRemoteIslandRestricted: z.boolean().default(false),
        }),
        exchangeReturnInfo: z.string().default(''),
        productInfoNotice: z.string().default(''),
      }),
      // ETicket Template
      z.object({
        type: z.literal('E-TICKET'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
      }),
    ]),
    output: z.object({
      id: z.number(),
      type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']),
      name: z.string(),
      message: z.string(),
    }),
  })
  async create(@Ctx() ctx: BackofficeAuthorizedContext, @Input() input: any) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.create',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
      name: z.string().min(1, '상품명은 필수입니다'),
      brandId: z.number().int().positive('브랜드를 선택해주세요'),
      categoryIds: z.array(z.number().int().positive()).optional(),
      thumbnailUrls: z.array(z.string().url()).optional(),
      description: z.string().optional(),
      detailContent: z.string().optional(),
      useStock: z.boolean().optional(),
      // Hotel 전용 필드
      baseCapacity: z.number().int().positive().optional(),
      maxCapacity: z.number().int().positive().optional(),
      checkInTime: z
        .string()
        .regex(TIME_FORMAT_REGEX)
        .transform(normalizeTime)
        .optional(),
      checkOutTime: z
        .string()
        .regex(TIME_FORMAT_REGEX)
        .transform(normalizeTime)
        .optional(),
      bedTypes: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      // Delivery 전용 필드
      useOptions: z.boolean().optional(),
      delivery: z
        .object({
          deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
          deliveryFee: z.number().int().nonnegative().optional(),
          freeDeliveryMinAmount: z.number().int().nonnegative().optional(),
          returnDeliveryFee: z.number().int().nonnegative().optional(),
          exchangeDeliveryFee: z.number().int().nonnegative().optional(),
          remoteAreaExtraFee: z.number().int().nonnegative().optional(),
          jejuExtraFee: z.number().int().nonnegative().optional(),
          isJejuRestricted: z.boolean().optional(),
          isRemoteIslandRestricted: z.boolean().optional(),
        })
        .optional(),
      exchangeReturnInfo: z.string().optional(),
      productInfoNotice: z.string().optional(),
    }),
    output: z.object({
      id: z.number(),
      name: z.string(),
      message: z.string(),
    }),
  })
  async update(@Ctx() ctx: BackofficeAuthorizedContext, @Input() input: any) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.update',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.number().int().positive('유효한 ID를 입력해주세요'),
    }),
    output: z.object({
      id: z.number(),
      message: z.string(),
    }),
  })
  async delete(@Ctx() ctx: BackofficeAuthorizedContext, @Input() input: any) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.delete',
      input
    );
  }
}
