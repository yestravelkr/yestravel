import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { type RegisterBrandInput, type UpdateBrandInput } from '@yestravelkr/api-types';

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

  async update(dto: UpdateBrandInput): Promise<BrandEntity> {
    const { id, ...updateData } = dto;

    // Check if brand exists
    const existingBrand = await this.repositoryProvider.BrandRepository.findOneBy({ id });
    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    // Check for name conflict if name is being updated
    if (updateData.name !== existingBrand.name) {
      const brandWithSameName = await this.repositoryProvider.BrandRepository.findOneBy({ name: updateData.name });
      if (brandWithSameName) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    // Use repository update method to preserve relationships
    return this.repositoryProvider.BrandRepository.updateBrand(id, updateData);
  }
}
