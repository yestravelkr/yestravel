import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import { RoleEnum } from './admin.schema';
import type { PartnerType } from '../../partner/auth/partner-auth.schema';
import type { CreatePartnerManagerInput } from './partner-admin.schema';

/**
 * PartnerAdminService - Brand/Influencer 매니저 통합 CRUD 서비스
 */
@Injectable()
export class PartnerAdminService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 파트너 매니저 생성
   */
  async createManager(dto: CreatePartnerManagerInput) {
    const { partnerType, partnerId, email, password, name, phoneNumber } = dto;
    const role = dto.role ?? RoleEnum.PARTNER_SUPER;

    if (partnerType === 'BRAND') {
      const brand =
        await this.repositoryProvider.BrandRepository.findOneByOrFail({
          id: partnerId,
        });
      const manager = await BrandManagerEntity.create({
        email,
        password,
        name,
        phoneNumber,
        role,
        brand,
      });
      return this.repositoryProvider.BrandManagerRepository.save(manager);
    }

    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOneByOrFail({
        id: partnerId,
      });
    const manager = await InfluencerManagerEntity.create({
      email,
      password,
      name,
      phoneNumber,
      role,
      influencer,
    });
    return this.repositoryProvider.InfluencerManagerRepository.save(manager);
  }

  /**
   * 파트너의 매니저 목록 조회
   */
  async findManagers(partnerType: PartnerType, partnerId: number) {
    const repo = this.getManagerRepository(partnerType);
    const relation = this.getPartnerRelation(partnerType);
    return repo.find({ where: { [relation]: { id: partnerId } } });
  }

  /**
   * 파트너 매니저 삭제
   */
  async deleteManager(partnerType: PartnerType, id: number, partnerId: number) {
    const repo = this.getManagerRepository(partnerType);
    const relation = this.getPartnerRelation(partnerType);
    await repo.delete({ id, [relation]: { id: partnerId } } as any);
  }

  /**
   * 파트너 매니저 상세 조회
   */
  async findManagerById(partnerType: PartnerType, id: number) {
    const repo = this.getManagerRepository(partnerType);
    const relation = this.getPartnerRelation(partnerType);
    return repo.findOneOrFail({ where: { id }, relations: [relation] });
  }

  private getManagerRepository(partnerType: PartnerType) {
    return partnerType === 'BRAND'
      ? this.repositoryProvider.BrandManagerRepository
      : this.repositoryProvider.InfluencerManagerRepository;
  }

  private getPartnerRelation(partnerType: PartnerType): string {
    return partnerType === 'BRAND' ? 'brand' : 'influencer';
  }
}
