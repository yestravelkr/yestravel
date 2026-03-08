import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import type { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import type { PartnerType } from '@src/module/partner/auth/partner-auth.schema';
import type {
  PartnerManagerStrategy,
  CreateManagerParams,
  PartnerManagerResult,
} from './partner-manager.strategy';

/**
 * InfluencerManagerStrategy - Influencer 매니저 CRUD 구현
 */
@Injectable()
export class InfluencerManagerStrategy implements PartnerManagerStrategy {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  getSupportedType(): PartnerType {
    return 'INFLUENCER';
  }

  async createManager(params: CreateManagerParams): Promise<LoginEntity> {
    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOneByOrFail({
        id: params.partnerId,
      });
    const manager = await InfluencerManagerEntity.create({
      email: params.email,
      password: params.password,
      name: params.name,
      phoneNumber: params.phoneNumber,
      role: params.role,
      influencer,
    });
    return this.repositoryProvider.InfluencerManagerRepository.save(manager);
  }

  async findManagers(partnerId: number): Promise<LoginEntity[]> {
    return this.repositoryProvider.InfluencerManagerRepository.find({
      where: { influencer: { id: partnerId } },
    });
  }

  async deleteManager(id: number, partnerId: number): Promise<void> {
    await this.repositoryProvider.InfluencerManagerRepository.delete({
      id,
      influencer: { id: partnerId },
    } as any);
  }

  async findManagerById(id: number): Promise<PartnerManagerResult> {
    const manager =
      await this.repositoryProvider.InfluencerManagerRepository.findOneOrFail({
        where: { id },
        relations: ['influencer'],
      });
    return { manager, partnerId: manager.influencer.id };
  }
}
