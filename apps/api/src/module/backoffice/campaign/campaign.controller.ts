import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CampaignService } from '@src/module/backoffice/campaign/campaign.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  campaignWithRelationsSchema,
  findAllCampaignsOutputSchema,
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
import type {
  CampaignWithRelations,
  FindAllCampaignsOutput,
  FindAllCampaignProductsOutput,
} from './campaign.dto';

@Controller()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.campaign.findAll')
  async findAll(data: FindAllCampaignsInput): Promise<FindAllCampaignsOutput> {
    const result = await this.campaignService.findAll(data);
    return findAllCampaignsOutputSchema.parse(result);
  }

  @MessagePattern('backoffice.campaign.findAllByProduct')
  async findAllByProduct(
    data: FindAllCampaignProductsInput
  ): Promise<FindAllCampaignProductsOutput> {
    const result = await this.campaignService.findAllByProduct(data);
    return findAllCampaignProductsOutputSchema.parse(result);
  }

  @MessagePattern('backoffice.campaign.findById')
  async findById(data: FindCampaignByIdInput): Promise<CampaignWithRelations> {
    const campaign = await this.campaignService.findById(data.id);
    return campaignWithRelationsSchema.parse(campaign);
  }

  @MessagePattern('backoffice.campaign.create')
  @Transactional
  async create(data: CreateCampaignInput): Promise<CampaignWithRelations> {
    const campaign = await this.campaignService.create(data);
    return campaignWithRelationsSchema.parse(campaign);
  }

  @MessagePattern('backoffice.campaign.update')
  @Transactional
  async update(data: UpdateCampaignInput): Promise<CampaignWithRelations> {
    const campaign = await this.campaignService.update(data.id, data);
    return campaignWithRelationsSchema.parse(campaign);
  }

  @MessagePattern('backoffice.campaign.delete')
  @Transactional
  async delete(data: DeleteCampaignInput): Promise<{ success: boolean }> {
    await this.campaignService.delete(data.id);
    return { success: true };
  }
}
