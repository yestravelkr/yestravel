import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { z } from 'zod';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from './campaign.type';

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
    dto: CreateCampaignInput
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
    dto: UpdateCampaignInput
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
