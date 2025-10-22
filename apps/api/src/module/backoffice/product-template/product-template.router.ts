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
  @Mutation({
    input: z.discriminatedUnion('type', [
      // Hotel Template
      z.object({
        type: z.literal('HOTEL'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
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
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            '입실 시간은 HH:MM 형식이어야 합니다'
          ),
        checkOutTime: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            '퇴실 시간은 HH:MM 형식이어야 합니다'
          ),
        bedTypes: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
      }),
      // Delivery Template
      z.object({
        type: z.literal('DELIVERY'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
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
}
