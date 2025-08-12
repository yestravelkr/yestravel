import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { AdminEntity } from '@src/module/backoffice/domain/admin.entity';
import type { UpdateAdminInput, UpdateAdminPasswordInput } from './admin.type';

@Injectable()
export class AdminService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider
  ) {}

  async findAll(): Promise<AdminEntity[]> {
    return this.repositoryProvider.AdminRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<AdminEntity | null> {
    return this.repositoryProvider.AdminRepository.findOneBy({ id });
  }

  async update(dto: UpdateAdminInput): Promise<AdminEntity> {
    const { id, ...updateData } = dto;

    // 존재 확인
    const existingAdmin = await this.repositoryProvider.AdminRepository.findOneBy({ id });
    if (!existingAdmin) {
      throw new NotFoundException('관리자를 찾을 수 없습니다');
    }

    // DDD 패턴: Entity의 update 메서드 사용
    existingAdmin.update(updateData);

    // Entity 저장
    return this.repositoryProvider.AdminRepository.save(existingAdmin);
  }

  async updatePassword(dto: UpdateAdminPasswordInput): Promise<void> {
    const { id, newPassword } = dto;

    // 존재 확인
    const existingAdmin = await this.repositoryProvider.AdminRepository.findOneBy({ id });
    if (!existingAdmin) {
      throw new NotFoundException('관리자를 찾을 수 없습니다');
    }

    // DDD 패턴: Entity의 updatePassword 메서드 사용
    await existingAdmin.updatePassword(newPassword);

    // Entity 저장
    await this.repositoryProvider.AdminRepository.save(existingAdmin);
  }
}