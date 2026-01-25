import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { Router, Query, Ctx, Input, UseMiddlewares } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  findAllOrdersInputSchema,
  getStatusCountsInputSchema,
  orderListResponseSchema,
  statusCountsSchema,
  filterOptionsResponseSchema,
  findByIdInputSchema,
  orderDetailResponseSchema,
} from './order.schema';

@Router({ alias: 'backofficeOrder' })
export class OrderRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllOrdersInputSchema.nullish().default({}),
    output: orderListResponseSchema,
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: z.infer<typeof findAllOrdersInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.findAll', input || {});
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: getStatusCountsInputSchema.nullish().default({}),
    output: statusCountsSchema,
  })
  async getStatusCounts(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: z.infer<typeof getStatusCountsInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeOrder.getStatusCounts',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: filterOptionsResponseSchema,
  })
  async getFilterOptions(@Ctx() ctx: BackofficeAuthorizedContext) {
    return this.microserviceClient.send('backofficeOrder.getFilterOptions', {});
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findByIdInputSchema,
    output: orderDetailResponseSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findByIdInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.findById', input);
  }
}
