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
} from 'nestjs-trpc-v2';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  normalizeTime,
  TIME_FORMAT_REGEX,
  TIME_FORMAT_ERROR_MESSAGE_KO,
} from '@src/utils/time.util';

// DeliveryPolicy 스키마
const deliveryPolicySchema = z.object({
  deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
  deliveryFee: z.number().int().nonnegative().default(0),
  freeDeliveryMinAmount: z.number().int().nonnegative().default(0),
  returnDeliveryFee: z.number().int().nonnegative().default(0),
  exchangeDeliveryFee: z.number().int().nonnegative().default(0),
  remoteAreaExtraFee: z.number().int().nonnegative().default(0),
  jejuExtraFee: z.number().int().nonnegative().default(0),
  isJejuRestricted: z.boolean().default(false),
  isRemoteIslandRestricted: z.boolean().default(false),
});

// HappyCallConfig 스키마
const happyCallConfigSchema = z.object({
  useHappyCall: z.boolean().default(false),
  useGuide: z.boolean().default(false),
  happyCallLink: z.string().nullish().default(null),
  guideLink: z.string().nullish().default(null),
});

@Router({ alias: 'backofficeProduct' })
export class ProductRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: z
      .object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().positive().default(30),
        orderBy: z.string().default('createdAt'),
        order: z.enum(['ASC', 'DESC']).default('DESC'),
        type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']).nullish(),
        name: z.string().nullish(),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).nullish(),
        brandIds: z.array(z.number().int()).nullish(),
        ids: z.array(z.number().int().positive()).nullish(),
        dateFilterType: z
          .enum(['CREATED_AT', 'UPDATED_AT'])
          .default('CREATED_AT'),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
      })
      .nullish()
      .default({}),
    output: z.object({
      data: z.array(
        z.object({
          id: z.number(),
          type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']),
          name: z.string(),
          brand: z.object({
            id: z.number(),
            name: z.string(),
          }),
          thumbnailUrls: z.array(z.string()),
          price: z.number(),
          status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
          useStock: z.boolean(),
          useCalendar: z.boolean(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      ),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext, @Input() input?: any) {
    return this.microserviceClient.send(
      'backofficeProduct.findAll',
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
        brandName: z.string(),
        productTemplateId: z.number().nullish(),
        campaignId: z.number().nullish(),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useCalendar: z.boolean(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        price: z.number(),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
        displayOrder: z.number().nullish(),
        baseCapacity: z.number(),
        maxCapacity: z.number(),
        checkInTime: z.string(),
        checkOutTime: z.string(),
        bedTypes: z.array(z.string()),
        tags: z.array(z.string()),
        cancellationFees: z.array(
          z.object({
            daysBeforeCheckIn: z.number(),
            feePercentage: z.number(),
          })
        ),
        happyCallConfig: happyCallConfigSchema.nullish(),
        hotelOptions: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            priceByDate: z.record(z.string(), z.number()),
            anotherPriceByDate: z.record(
              z.string(),
              z.object({
                supplyPrice: z.number(),
                commission: z.number(),
              })
            ),
          })
        ),
        hotelSkus: z.array(
          z.object({
            checkInDate: z.string(),
            quantity: z.number(),
          })
        ),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      // Delivery Detail
      z.object({
        type: z.literal('DELIVERY'),
        id: z.number(),
        name: z.string(),
        brandId: z.number(),
        brandName: z.string(),
        productTemplateId: z.number().nullish(),
        campaignId: z.number().nullish(),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useCalendar: z.boolean(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        price: z.number(),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
        displayOrder: z.number().nullish(),
        delivery: deliveryPolicySchema,
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
        brandName: z.string(),
        productTemplateId: z.number().nullish(),
        campaignId: z.number().nullish(),
        thumbnailUrls: z.array(z.string()),
        description: z.string(),
        detailContent: z.string(),
        useCalendar: z.boolean(),
        useStock: z.boolean(),
        useOptions: z.boolean(),
        price: z.number(),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
        displayOrder: z.number().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ]),
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: { id: number }
  ) {
    return this.microserviceClient.send('backofficeProduct.findById', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.discriminatedUnion('type', [
      // Hotel Product
      z.object({
        type: z.literal('HOTEL'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.literal(true),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
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
          .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
          .transform(normalizeTime),
        checkOutTime: z
          .string()
          .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
          .transform(normalizeTime),
        bedTypes: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        cancellationFees: z
          .array(
            z.object({
              daysBeforeCheckIn: z.number().int().min(0),
              feePercentage: z.number().min(0).max(100),
            })
          )
          .default([]),
        hotelOptions: z
          .array(
            z.object({
              id: z.number().int().positive().nullish(),
              name: z.string().min(1, '옵션명은 필수입니다'),
              priceByDate: z
                .record(z.string(), z.number().int().nonnegative())
                .default({}),
              anotherPriceByDate: z
                .record(
                  z.string(),
                  z.object({
                    supplyPrice: z.number().int().nonnegative(),
                    commission: z.number().int().nonnegative(),
                  })
                )
                .default({}),
            })
          )
          .default([]),
        hotelSkus: z
          .array(
            z.object({
              checkInDate: z
                .string()
                .regex(
                  /^\d{4}-\d{2}-\d{2}$/,
                  '날짜는 YYYY-MM-DD 형식이어야 합니다'
                ),
              quantity: z.number().int().min(0, '재고는 0 이상이어야 합니다'),
            })
          )
          .default([]),
        happyCallConfig: happyCallConfigSchema.nullish().default(null),
      }),
      // Delivery Product
      z.object({
        type: z.literal('DELIVERY'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.boolean().default(false),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
        delivery: deliveryPolicySchema,
        exchangeReturnInfo: z.string().default(''),
        productInfoNotice: z.string().default(''),
      }),
      // ETicket Product
      z.object({
        type: z.literal('E-TICKET'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.boolean().default(false),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
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
    return this.microserviceClient.send('backofficeProduct.create', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.discriminatedUnion('type', [
      // Hotel Product Update
      z.object({
        type: z.literal('HOTEL'),
        id: z.number().int().positive('유효한 ID를 입력해주세요'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.literal(true),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
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
          .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
          .transform(normalizeTime),
        checkOutTime: z
          .string()
          .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
          .transform(normalizeTime),
        bedTypes: z.array(z.string()).default([]),
        tags: z.array(z.string()).default([]),
        cancellationFees: z
          .array(
            z.object({
              daysBeforeCheckIn: z.number().int().min(0),
              feePercentage: z.number().min(0).max(100),
            })
          )
          .default([]),
        hotelOptions: z
          .array(
            z.object({
              id: z.number().int().positive().nullish(),
              name: z.string().min(1, '옵션명은 필수입니다'),
              priceByDate: z
                .record(z.string(), z.number().int().nonnegative())
                .default({}),
              anotherPriceByDate: z
                .record(
                  z.string(),
                  z.object({
                    supplyPrice: z.number().int().nonnegative(),
                    commission: z.number().int().nonnegative(),
                  })
                )
                .default({}),
            })
          )
          .default([]),
        hotelSkus: z
          .array(
            z.object({
              checkInDate: z
                .string()
                .regex(
                  /^\d{4}-\d{2}-\d{2}$/,
                  '날짜는 YYYY-MM-DD 형식이어야 합니다'
                ),
              quantity: z.number().int().min(0, '재고는 0 이상이어야 합니다'),
            })
          )
          .default([]),
        happyCallConfig: happyCallConfigSchema.nullish().default(null),
      }),
      // Delivery Product Update
      z.object({
        type: z.literal('DELIVERY'),
        id: z.number().int().positive('유효한 ID를 입력해주세요'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.boolean().default(false),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
        delivery: deliveryPolicySchema,
        exchangeReturnInfo: z.string().default(''),
        productInfoNotice: z.string().default(''),
      }),
      // ETicket Product Update
      z.object({
        type: z.literal('E-TICKET'),
        id: z.number().int().positive('유효한 ID를 입력해주세요'),
        name: z.string().min(1, '상품명은 필수입니다'),
        brandId: z.number().int().positive('브랜드를 선택해주세요'),
        productTemplateId: z.number().int().positive().nullish(),
        campaignId: z.number().int().positive().nullish(),
        categoryIds: z.array(z.number().int().positive()).default([]),
        thumbnailUrls: z.array(z.string().url()).default([]),
        description: z.string().default(''),
        detailContent: z.string().default(''),
        useCalendar: z.boolean().default(false),
        useStock: z.boolean().default(false),
        useOptions: z.boolean().default(false),
        price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
        status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
        displayOrder: z.number().int().nullish(),
      }),
    ]),
    output: z.object({
      id: z.number(),
      name: z.string(),
      message: z.string(),
    }),
  })
  async update(@Ctx() ctx: BackofficeAuthorizedContext, @Input() input: any) {
    return this.microserviceClient.send('backofficeProduct.update', input);
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
    return this.microserviceClient.send('backofficeProduct.delete', input);
  }
}
