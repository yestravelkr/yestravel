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
import { AllowRoles } from '@src/shared/auth/allow-roles.decorator';
import {
  findAllOrdersInputSchema,
  getStatusCountsInputSchema,
  orderListResponseSchema,
  statusCountsSchema,
  filterOptionsResponseSchema,
  findByIdInputSchema,
  orderDetailResponseSchema,
  updateStatusInputSchema,
  updateStatusResponseSchema,
  revertStatusInputSchema,
  revertStatusResponseSchema,
  exportToExcelInputSchema,
  exportToExcelResponseSchema,
  cancelOrderInputSchema,
  cancelOrderResponseSchema,
  getHistoryInputSchema,
  getHistoryResponseSchema,
} from './order.schema';

@Router({ alias: 'backofficeOrder' })
export class OrderRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
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
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
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
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
  @Query({
    output: filterOptionsResponseSchema,
  })
  async getFilterOptions(@Ctx() ctx: BackofficeAuthorizedContext) {
    return this.microserviceClient.send('backofficeOrder.getFilterOptions', {});
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
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

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN'], 'STAFF')
  @Mutation({
    input: updateStatusInputSchema,
    output: updateStatusResponseSchema,
  })
  async updateStatus(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof updateStatusInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.updateStatus', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN'], 'STAFF')
  @Mutation({
    input: revertStatusInputSchema,
    output: revertStatusResponseSchema,
  })
  async revertStatus(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof revertStatusInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.revertStatus', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN'], 'STAFF')
  @Mutation({
    input: cancelOrderInputSchema,
    output: cancelOrderResponseSchema,
  })
  async cancelOrder(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof cancelOrderInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.cancelOrder', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
  @Mutation({
    input: exportToExcelInputSchema.nullish().default({}),
    output: exportToExcelResponseSchema,
  })
  async exportToExcel(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: z.infer<typeof exportToExcelInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeOrder.exportToExcel',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @AllowRoles(['ADMIN', 'BRAND', 'INFLUENCER'], 'STAFF')
  @Query({
    input: getHistoryInputSchema,
    output: getHistoryResponseSchema,
  })
  async getHistory(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof getHistoryInputSchema>
  ) {
    return this.microserviceClient.send('backofficeOrder.getHistory', input);
  }
}
