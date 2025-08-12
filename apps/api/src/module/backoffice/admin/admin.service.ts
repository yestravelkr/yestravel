import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { AdminEntity } from '@src/module/backoffice/domain/admin.entity';

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
}