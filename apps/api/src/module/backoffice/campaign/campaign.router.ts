import { Router, Query, UseMiddlewares, Mutation, Input } from 'nestjs-trpc-v2';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';
import {
  createCampaignInputSchema,
  updateCampaignInputSchema,
  findCampaignByIdInputSchema,
  deleteCampaignInputSchema,
  campaignWithRelationsSchema,
  findAllCampaignsInputSchema,
  findAllCampaignsOutputSchema,
  findAllCampaignProductsInputSchema,
  findAllCampaignProductsOutputSchema,
} from './campaign.schema';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  FindCampaignByIdInput,
  DeleteCampaignInput,
  FindAllCampaignsInput,
  FindAllCampaignProductsInput,
} from './campaign.type';

@Router({ alias: 'backofficeCampaign' })
export class CampaignRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllCampaignsInputSchema.nullish().default({}),
    output: findAllCampaignsOutputSchema,
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: FindAllCampaignsInput
  ) {
    return this.microserviceClient.send(
      'backoffice.campaign.findAll',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllCampaignProductsInputSchema.nullish().default({}),
    output: findAllCampaignProductsOutputSchema,
  })
  async findAllByProduct(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input?: FindAllCampaignProductsInput
  ) {
    return this.microserviceClient.send(
      'backoffice.campaign.findAllByProduct',
      input || {}
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findCampaignByIdInputSchema,
    output: campaignWithRelationsSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindCampaignByIdInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.findById',
      input
    );
    return campaignWithRelationsSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createCampaignInputSchema,
    output: campaignWithRelationsSchema,
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateCampaignInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.create',
      input
    );
    return campaignWithRelationsSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: updateCampaignInputSchema,
    output: campaignWithRelationsSchema,
  })
  async update(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateCampaignInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.update',
      input
    );
    return campaignWithRelationsSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: deleteCampaignInputSchema,
    output: z.object({ success: z.boolean() }),
  })
  async delete(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: DeleteCampaignInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.delete',
      input
    );
    return z.object({ success: z.boolean() }).parse(output);
  }
}
