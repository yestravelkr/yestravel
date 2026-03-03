import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import type {
  CreateStaffData,
  DeleteStaffData,
  FindAllStaffData,
  GetProfileData,
} from './partner-account.type';

@Injectable()
export class PartnerAccountService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async createStaff(data: CreateStaffData) {
    const { email, password, name, phoneNumber, partnerType, partnerId } = data;

    if (partnerType === 'BRAND') {
      const existing =
        await this.repositoryProvider.BrandManagerRepository.findOneBy({
          email,
        });
      if (existing) throw new ConflictException('이미 사용 중인 이메일입니다');

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
        role: 'PARTNER_STAFF',
        brand,
      });
      return this.repositoryProvider.BrandManagerRepository.save(manager);
    }

    const existing =
      await this.repositoryProvider.InfluencerManagerRepository.findOneBy({
        email,
      });
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다');

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
      role: 'PARTNER_STAFF',
      influencer,
    });
    return this.repositoryProvider.InfluencerManagerRepository.save(manager);
  }

  async findAllStaff(data: FindAllStaffData) {
    const { partnerType, partnerId } = data;

    if (partnerType === 'BRAND') {
      return this.repositoryProvider.BrandManagerRepository.find({
        where: { brand: { id: partnerId } },
        order: { createdAt: 'DESC' },
      });
    }

    return this.repositoryProvider.InfluencerManagerRepository.find({
      where: { influencer: { id: partnerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteStaff(data: DeleteStaffData) {
    const { id, partnerType, partnerId } = data;

    if (partnerType === 'BRAND') {
      const manager =
        await this.repositoryProvider.BrandManagerRepository.findOne({
          where: { id },
          relations: ['brand'],
        });
      if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');
      if (manager.role === 'PARTNER_SUPER')
        throw new ForbiddenException('SUPER 계정은 삭제할 수 없습니다');
      if (manager.brand.id !== partnerId)
        throw new ForbiddenException(
          '다른 브랜드의 매니저를 삭제할 수 없습니다'
        );
      await this.repositoryProvider.BrandManagerRepository.softDelete(id);
    } else {
      const manager =
        await this.repositoryProvider.InfluencerManagerRepository.findOne({
          where: { id },
          relations: ['influencer'],
        });
      if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');
      if (manager.role === 'PARTNER_SUPER')
        throw new ForbiddenException('SUPER 계정은 삭제할 수 없습니다');
      if (manager.influencer.id !== partnerId)
        throw new ForbiddenException(
          '다른 인플루언서의 매니저를 삭제할 수 없습니다'
        );
      await this.repositoryProvider.InfluencerManagerRepository.softDelete(id);
    }

    return { success: true };
  }

  async getProfile(data: GetProfileData) {
    const { id, partnerType } = data;

    if (partnerType === 'BRAND') {
      const manager =
        await this.repositoryProvider.BrandManagerRepository.findOne({
          where: { id },
          relations: ['brand'],
        });
      if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');
      return {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        phoneNumber: manager.phoneNumber,
        role: manager.role,
        partnerType: 'BRAND' as const,
        partnerId: manager.brand.id,
      };
    }

    const manager =
      await this.repositoryProvider.InfluencerManagerRepository.findOne({
        where: { id },
        relations: ['influencer'],
      });
    if (!manager) throw new NotFoundException('매니저를 찾을 수 없습니다');
    return {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phoneNumber: manager.phoneNumber,
      role: manager.role,
      partnerType: 'INFLUENCER' as const,
      partnerId: manager.influencer.id,
    };
  }
}
