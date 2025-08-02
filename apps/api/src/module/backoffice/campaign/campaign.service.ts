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

  async findById(id: number): Promise<CampaignEntity | null> {
    return this.repositoryProvider.CampaignRepository.findOneBy({ id });
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

    if (dto.title !== undefined) campaign.title = dto.title;
    if (dto.startAt !== undefined) campaign.startAt = dto.startAt;
    if (dto.endAt !== undefined) campaign.endAt = dto.endAt;
    if (dto.description !== undefined) campaign.description = dto.description;
    if (dto.thumbnail !== undefined) campaign.thumbnail = dto.thumbnail;

    return this.repositoryProvider.CampaignRepository.save(campaign);
  }

  async delete(id: number): Promise<void> {
    const campaign = await this.repositoryProvider.CampaignRepository.findOneBy(
      { id }
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.repositoryProvider.CampaignRepository.remove(campaign);
  }
}
