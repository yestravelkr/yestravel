import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import { RoleEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  CreateStaffData,
  DeleteStaffData,
  FindAllStaffData,
  GetProfileData,
} from './partner-account.type';

@Injectable()
export class PartnerAccountService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  private getManagerRepository(partnerType: string) {
    return partnerType === 'BRAND'
      ? this.repositoryProvider.BrandManagerRepository
      : this.repositoryProvider.InfluencerManagerRepository;
  }

  private getRelationName(partnerType: string) {
    return partnerType === 'BRAND' ? 'brand' : 'influencer';
  }

  async createStaff(data: CreateStaffData) {
    const { email, password, name, phoneNumber, partnerType, partnerId } = data;

    const managerRepo = this.getManagerRepository(partnerType);
    const existing = await managerRepo.findOneBy({ email });
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다');

    if (partnerType === 'BRAND') {
      const brand =
        await this.repositoryProvider.BrandRepository.findOneByOrFail({
          id: partnerId,
        }).catch(() => {
          throw new NotFoundException('브랜드를 찾을 수 없습니다');
        });

      const manager = await BrandManagerEntity.create({
        email,
        password,
        name,
        phoneNumber,
        role: RoleEnum.PARTNER_STAFF,
        brand,
      });
      return this.repositoryProvider.BrandManagerRepository.save(manager);
    }

    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOneByOrFail({
        id: partnerId,
      }).catch(() => {
        throw new NotFoundException('인플루언서를 찾을 수 없습니다');
      });

    const manager = await InfluencerManagerEntity.create({
      email,
      password,
      name,
      phoneNumber,
      role: RoleEnum.PARTNER_STAFF,
      influencer,
    });
    return this.repositoryProvider.InfluencerManagerRepository.save(manager);
  }

  async findAllStaff(data: FindAllStaffData) {
    const { partnerType, partnerId } = data;
    const relation = this.getRelationName(partnerType);

    return this.getManagerRepository(partnerType).find({
      where: { [relation]: { id: partnerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteStaff(data: DeleteStaffData) {
    const { id, partnerType, partnerId } = data;
    const relation = this.getRelationName(partnerType);
    const managerRepo = this.getManagerRepository(partnerType);

    const manager = await managerRepo.findOne({
      where: { id },
      relations: [relation],
    });
    if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');
    if (manager.role === RoleEnum.PARTNER_SUPER)
      throw new ForbiddenException('SUPER 계정은 삭제할 수 없습니다');
    if ((manager as any)[relation].id !== partnerId)
      throw new ForbiddenException(
        `다른 ${partnerType === 'BRAND' ? '브랜드' : '인플루언서'}의 매니저를 삭제할 수 없습니다`
      );
    await managerRepo.softDelete(id);

    return { success: true };
  }

  async getProfile(data: GetProfileData) {
    const { id, partnerType } = data;
    const relation = this.getRelationName(partnerType);
    const managerRepo = this.getManagerRepository(partnerType);

    const manager = await managerRepo.findOne({
      where: { id },
      relations: [relation],
    });
    if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');

    return {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phoneNumber: manager.phoneNumber,
      role: manager.role,
      partnerType: partnerType as 'BRAND' | 'INFLUENCER',
      partnerId: (manager as any)[relation].id,
    };
  }
}
