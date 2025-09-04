import { Router, Query, UseMiddlewares, Mutation, Input } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';
import {
  createCampaignInputSchema,
  updateCampaignInputSchema,
  findCampaignByIdInputSchema,
  deleteCampaignInputSchema,
  campaignSchema,
} from './campaign.schema';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  FindCampaignByIdInput,
  DeleteCampaignInput,
} from './campaign.type';

@Router({ alias: 'backofficeCampaign' })
export class CampaignRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(campaignSchema),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.findAll',
      {}
    );
    return z.array(campaignSchema).parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findCampaignByIdInputSchema,
    output: campaignSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindCampaignByIdInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.findById',
      input
    );
    return campaignSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createCampaignInputSchema,
    output: campaignSchema,
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateCampaignInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.create',
      input
    );
    return campaignSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: updateCampaignInputSchema,
    output: campaignSchema,
  })
  async update(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateCampaignInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.campaign.update',
      input
    );
    return campaignSchema.parse(output);
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
