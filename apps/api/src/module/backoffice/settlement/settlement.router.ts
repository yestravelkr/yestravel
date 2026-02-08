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
  findAllSettlementsInputSchema,
  findInfluencerSettlementByIdInputSchema,
  findBrandSettlementByIdInputSchema,
  createInfluencerSettlementInputSchema,
  createBrandSettlementInputSchema,
  completeSettlementsInputSchema,
  exportSettlementToExcelInputSchema,
  settlementListResponseSchema,
  influencerSettlementDetailResponseSchema,
  brandSettlementDetailResponseSchema,
  settlementFilterOptionsResponseSchema,
  createSettlementResponseSchema,
  completeSettlementsResponseSchema,
  exportSettlementToExcelResponseSchema,
} from './settlement.schema';

@Router({ alias: 'backofficeSettlement' })
export class SettlementRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllSettlementsInputSchema.nullish().default({}),
    output: settlementListResponseSchema,
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: z.infer<typeof findAllSettlementsInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.findAll',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findInfluencerSettlementByIdInputSchema,
    output: influencerSettlementDetailResponseSchema,
  })
  async findInfluencerSettlementById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findInfluencerSettlementByIdInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.findInfluencerSettlementById',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findBrandSettlementByIdInputSchema,
    output: brandSettlementDetailResponseSchema,
  })
  async findBrandSettlementById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findBrandSettlementByIdInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.findBrandSettlementById',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: settlementFilterOptionsResponseSchema,
  })
  async getFilterOptions(@Ctx() ctx: BackofficeAuthorizedContext) {
    return this.microserviceClient.send(
      'backofficeSettlement.getFilterOptions',
      {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createInfluencerSettlementInputSchema,
    output: createSettlementResponseSchema,
  })
  async createInfluencerSettlement(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof createInfluencerSettlementInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.createInfluencerSettlement',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createBrandSettlementInputSchema,
    output: createSettlementResponseSchema,
  })
  async createBrandSettlement(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof createBrandSettlementInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.createBrandSettlement',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: completeSettlementsInputSchema,
    output: completeSettlementsResponseSchema,
  })
  async completeInfluencerSettlements(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof completeSettlementsInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.completeInfluencerSettlements',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: completeSettlementsInputSchema,
    output: completeSettlementsResponseSchema,
  })
  async completeBrandSettlements(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof completeSettlementsInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.completeBrandSettlements',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: exportSettlementToExcelInputSchema,
    output: exportSettlementToExcelResponseSchema,
  })
  async exportToExcel(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof exportSettlementToExcelInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeSettlement.exportToExcel',
      input
    );
  }
}
