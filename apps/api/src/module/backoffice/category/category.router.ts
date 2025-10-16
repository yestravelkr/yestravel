import { z } from 'zod';
import {
  Router,
  Query,
  UseMiddlewares,
  Mutation,
  Input,
  Ctx,
} from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import type {
  CreateCategoryInput,
  FindAllCategoriesInput,
} from './category.type';

// Router에서는 z.object()로 직접 정의
const PRODUCT_TYPE_ENUM_VALUE = ['HOTEL', 'E-TICKET', 'DELIVERY'] as const;

@Router({ alias: 'backofficeCategory' })
export class CategoryRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: z.object({
      name: z.string().min(1, '카테고리 이름은 필수입니다'),
      productType: z.enum(PRODUCT_TYPE_ENUM_VALUE),
      parentId: z.number().nullish(),
    }),
    output: z.object({
      id: z.number(),
      name: z.string(),
      productType: z.string(),
      parentId: z.number().nullish(),
      level: z.number(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateCategoryInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.category.create',
      input
    );
    return output;
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: z.object({
      productType: z.enum(PRODUCT_TYPE_ENUM_VALUE).optional(),
    }),
    output: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        productType: z.string(),
        parentId: z.number().nullish(),
        level: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    ),
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindAllCategoriesInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.category.findAll',
      input
    );
    return output;
  }
}
