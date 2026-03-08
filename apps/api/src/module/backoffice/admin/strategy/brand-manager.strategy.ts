import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import type { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import type { PartnerType } from '@src/module/partner/auth/partner-auth.schema';
import type {
  PartnerManagerStrategy,
  CreateManagerParams,
  PartnerManagerResult,
} from './partner-manager.strategy';

/**
 * BrandManagerStrategy - Brand 매니저 CRUD 구현
 */
@Injectable()
export class BrandManagerStrategy implements PartnerManagerStrategy {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  getSupportedType(): PartnerType {
    return 'BRAND';
  }

  async createManager(params: CreateManagerParams): Promise<LoginEntity> {
    const brand = await this.repositoryProvider.BrandRepository.findOneByOrFail(
      {
        id: params.partnerId,
      }
    );
    const manager = await BrandManagerEntity.create({
      email: params.email,
      password: params.password,
      name: params.name,
      phoneNumber: params.phoneNumber,
      role: params.role,
      brand,
    });
    return this.repositoryProvider.BrandManagerRepository.save(manager);
  }

  async findManagers(partnerId: number): Promise<LoginEntity[]> {
    return this.repositoryProvider.BrandManagerRepository.find({
      where: { brand: { id: partnerId } },
    });
  }

  async deleteManager(id: number, partnerId: number): Promise<void> {
    await this.repositoryProvider.BrandManagerRepository.delete({
      id,
      brand: { id: partnerId },
    } as any);
  }

  async findManagerById(id: number): Promise<PartnerManagerResult> {
    const manager =
      await this.repositoryProvider.BrandManagerRepository.findOneOrFail({
        where: { id },
        relations: ['brand'],
      });
    return { manager, partnerId: manager.brand.id };
  }
}
