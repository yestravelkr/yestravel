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
import type { PartnerScope } from './order.dto';

@Router({ alias: 'backofficeOrder' })
export class OrderRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  private extractPartnerScope(ctx: BackofficeAuthorizedContext): PartnerScope {
    return {
      authType: ctx.admin!.authType,
      partnerId: ctx.admin!.partnerId,
    };
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
    const scope = this.extractPartnerScope(ctx);
    return this.microserviceClient.send('backofficeOrder.findAll', {
      ...(input || {}),
      scope,
    });
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
    const scope = this.extractPartnerScope(ctx);
    return this.microserviceClient.send('backofficeOrder.getStatusCounts', {
      ...(input || {}),
      scope,
    });
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: filterOptionsResponseSchema,
  })
  async getFilterOptions(@Ctx() ctx: BackofficeAuthorizedContext) {
    const scope = this.extractPartnerScope(ctx);
    return this.microserviceClient.send('backofficeOrder.getFilterOptions', {
      scope,
    });
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
    const scope = this.extractPartnerScope(ctx);
    return this.microserviceClient.send('backofficeOrder.findById', {
      ...input,
      scope,
    });
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
  @AllowRoles(['ADMIN'], 'STAFF')
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
  @Query({
    input: getHistoryInputSchema,
    output: getHistoryResponseSchema,
  })
  async getHistory(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof getHistoryInputSchema>
  ) {
    const scope = this.extractPartnerScope(ctx);
    return this.microserviceClient.send('backofficeOrder.getHistory', {
      ...input,
      scope,
    });
  }
}
