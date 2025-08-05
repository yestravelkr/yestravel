import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { z } from 'zod';
import {
  createCampaignInputSchema,
  updateCampaignInputSchema,
} from '@src/module/backoffice/campaign/campaign.schema';

@Injectable()
export class CampaignService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(): Promise<CampaignEntity[]> {
    return this.repositoryProvider.CampaignRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<CampaignEntity> {
    const campaign = await this.repositoryProvider.CampaignRepository.findOneBy({ id });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    return campaign;
  }

  async create(
    dto: z.infer<typeof createCampaignInputSchema>
  ): Promise<CampaignEntity> {
    const campaign = this.repositoryProvider.CampaignRepository.create({
      title: dto.title,
      startAt: dto.startAt,
      endAt: dto.endAt,
      description: dto.description,
      thumbnail: dto.thumbnail,
    });

    return this.repositoryProvider.CampaignRepository.save(campaign);
  }

  async update(
    id: number,
    dto: z.infer<typeof updateCampaignInputSchema>
  ): Promise<CampaignEntity> {
    const campaign = await this.repositoryProvider.CampaignRepository.findOneBy(
      { id }
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    campaign.title = dto.title;
    campaign.startAt = dto.startAt;
    campaign.endAt = dto.endAt;
    campaign.description = dto.description;
    campaign.thumbnail = dto.thumbnail;

    return this.repositoryProvider.CampaignRepository.save(campaign);
  }

  async delete(id: number): Promise<void> {
    const campaign = await this.repositoryProvider.CampaignRepository.findOneByOrFail(
      { id }
    ).catch(() => {
      throw new NotFoundException('Campaign not found');
    });

    await this.repositoryProvider.CampaignRepository.softRemove(campaign);
  }
}
