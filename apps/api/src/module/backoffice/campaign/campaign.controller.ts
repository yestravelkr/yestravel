import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CampaignService } from '@src/module/backoffice/campaign/campaign.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import type {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  FindCampaignByIdInput,
  DeleteCampaignInput,
} from './campaign.type';

@Controller()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly transactionService: TransactionService
  ) {}

  private formatCampaignResponse(campaign: CampaignEntity): Campaign {
    return {
      id: campaign.id,
      title: campaign.title,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
      description: campaign.description,
      thumbnail: campaign.thumbnail,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }

  @MessagePattern('backoffice.campaign.findAll')
  async findAll(): Promise<Campaign[]> {
    const campaigns = await this.campaignService.findAll();
    return campaigns.map(campaign => this.formatCampaignResponse(campaign));
  }
  
  @MessagePattern('backoffice.campaign.findById')
  async findById(data: FindCampaignByIdInput): Promise<Campaign> {
    const campaign = await this.campaignService.findById(data.id);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.create')
  @Transactional
  async create(data: CreateCampaignInput): Promise<Campaign> {
    const campaign = await this.campaignService.create(data);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.update')
  @Transactional
  async update(data: UpdateCampaignInput): Promise<Campaign> {
    const campaign = await this.campaignService.update(data.id, data);
    return this.formatCampaignResponse(campaign);
  }

  @MessagePattern('backoffice.campaign.delete')
  @Transactional
  async delete(data: DeleteCampaignInput): Promise<{ success: boolean }> {
    await this.campaignService.delete(data.id);
    return { success: true };
  }
}