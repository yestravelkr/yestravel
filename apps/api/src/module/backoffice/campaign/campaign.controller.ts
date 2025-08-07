import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CampaignService } from '@src/module/backoffice/campaign/campaign.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { z } from 'zod';
import {
  createCampaignInputSchema,
  updateCampaignInputSchema,
  findCampaignByIdInputSchema,
  deleteCampaignInputSchema,
  campaignSchema
} from '@yestravelkr/yestravel-schema';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  FindCampaignByIdInput,
  DeleteCampaignInput,
  Campaign
} from './campaign.type';

@Controller()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly transactionService: TransactionService
  ) {}

  private formatCampaignResponse(campaign: CampaignEntity): z.infer<typeof campaignSchema> {
    return campaignSchema.parse(campaign);
  }

  @MessagePattern('backoffice.campaign.findAll')
  async findAll(): Promise<Array<z.infer<typeof campaignSchema>>> {
    const campaigns = await this.campaignService.findAll();
    return campaigns.map(campaign => this.formatCampaignResponse(campaign));
  }
  
  @MessagePattern('backoffice.campaign.findById')
  async findById(data: z.infer<typeof findCampaignByIdInputSchema>): Promise<z.infer<typeof campaignSchema>> {
    const campaign = await this.campaignService.findById(data.id);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.create')
  @Transactional
  async create(data: z.infer<typeof createCampaignInputSchema>): Promise<z.infer<typeof campaignSchema>> {
    const campaign = await this.campaignService.create(data);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.update')
  @Transactional
  async update(data: z.infer<typeof updateCampaignInputSchema>): Promise<z.infer<typeof campaignSchema>> {
    const campaign = await this.campaignService.update(data.id, data);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.delete')
  @Transactional
  async delete(data: z.infer<typeof deleteCampaignInputSchema>): Promise<{ success: boolean }> {
    await this.campaignService.delete(data.id);
    return { success: true };
  }
}