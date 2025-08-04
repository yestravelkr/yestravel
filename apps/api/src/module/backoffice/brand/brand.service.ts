import { Injectable, ConflictException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { type RegisterBrandInput, type UpdateBrandInput } from '@yestravelkr/yestravel-schema';

@Injectable()
export class BrandService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider
  ) {}

  async register(dto: RegisterBrandInput): Promise<BrandEntity> {
    // Check if brand with the same name already exists
    const existingBrand = await this.repositoryProvider.BrandRepository.findOneBy({ name: dto.name });
    
    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }
    
    return this.repositoryProvider.BrandRepository.register(dto);
  }
  
  async findAll(): Promise<BrandEntity[]> {
    return this.repositoryProvider.BrandRepository.find({
      order: { createdAt: 'DESC' }
    });
  }
  
  async findById(id: number): Promise<BrandEntity | null> {
    return this.repositoryProvider.BrandRepository.findOneBy({ id });
  }
}