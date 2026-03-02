import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import { RoleEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  RegisterBrandInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreateBrandManagerInput,
} from './brand.type';

@Injectable()
export class BrandService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async register(dto: RegisterBrandInput): Promise<BrandEntity> {
    // Check if brand with the same name already exists
    const existingBrand =
      await this.repositoryProvider.BrandRepository.findOneBy({
        name: dto.name,
      });

    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    return this.repositoryProvider.BrandRepository.register(dto);
  }

  async findAll(): Promise<BrandEntity[]> {
    return this.repositoryProvider.BrandRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<BrandEntity> {
    return this.repositoryProvider.BrandRepository.findOneOrFail({
      where: { id },
      relations: ['brandManagers'],
    });
  }

  async update(dto: UpdateBrandInput): Promise<BrandEntity> {
    const { id, ...updateData } = dto;

    // Check if brand exists (will throw if not found)
    const existingBrand =
      await this.repositoryProvider.BrandRepository.findOneByOrFail({ id });

    // Check for name conflict if name is being updated
    if (updateData.name !== existingBrand.name) {
      const brandWithSameName =
        await this.repositoryProvider.BrandRepository.findOneBy({
          name: updateData.name,
        });
      if (brandWithSameName) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    // Use repository update method to preserve relationships
    return this.repositoryProvider.BrandRepository.updateBrand(id, updateData);
  }

  async delete(dto: DeleteBrandInput): Promise<void> {
    const { id } = dto;

    // Check if brand exists
    const brand = await this.repositoryProvider.BrandRepository.findOneBy({
      id,
    });

    if (!brand) {
      throw new NotFoundException(`브랜드를 찾을 수 없습니다 (ID: ${id})`);
    }

    // Check if brand has associated products
    const productCount = await this.repositoryProvider.ProductRepository.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `이 브랜드에 연결된 상품이 ${productCount}개 있어 삭제할 수 없습니다. 먼저 상품을 삭제하거나 다른 브랜드로 변경해주세요.`
      );
    }

    // Check if brand has associated product templates
    const templateCount =
      await this.repositoryProvider.ProductTemplateRepository.count({
        where: { brandId: id },
      });

    if (templateCount > 0) {
      throw new ConflictException(
        `이 브랜드에 연결된 품목이 ${templateCount}개 있어 삭제할 수 없습니다. 먼저 품목을 삭제하거나 다른 브랜드로 변경해주세요.`
      );
    }

    await this.repositoryProvider.BrandRepository.softRemove(brand);
  }

  async createManager(
    dto: CreateBrandManagerInput
  ): Promise<BrandManagerEntity> {
    const { email, password, name, phoneNumber, brandId } = dto;

    // 이메일 중복 체크
    const existing =
      await this.repositoryProvider.BrandManagerRepository.findOneBy({ email });
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    const brand = await this.repositoryProvider.BrandRepository.findOneByOrFail(
      { id: brandId }
    ).catch(() => {
      throw new NotFoundException('브랜드를 찾을 수 없습니다');
    });

    const manager = await BrandManagerEntity.create({
      email,
      password,
      name,
      phoneNumber,
      role: RoleEnum.PARTNER_SUPER,
      brand,
    });

    return this.repositoryProvider.BrandManagerRepository.save(manager);
  }

  async findManagers(brandId: number): Promise<BrandManagerEntity[]> {
    return this.repositoryProvider.BrandManagerRepository.find({
      where: { brand: { id: brandId } },
      order: { createdAt: 'DESC' },
    });
  }
}
