import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BrandService } from '@src/module/backoffice/brand/brand.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import {
  createBrandManagerOutputSchema,
  brandManagerListSchema,
  brandManagerProfileSchema,
} from './brand.schema';
import type {
  Brand,
  RegisterBrandInput,
  FindBrandByIdInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreateBrandManagerInput,
  CreateBrandManagerOutput,
  FindBrandManagersInput,
  DeleteBrandManagerInput,
  FindBrandManagerByIdInput,
  BrandManagerProfile,
} from './brand.type';

@Controller()
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly transactionService: TransactionService
  ) {}

  private formatBrandResponse(brand: BrandEntity): Brand {
    return {
      id: brand.id,
      name: brand.name,
      email: brand.email,
      phoneNumber: brand.phoneNumber,
      businessInfo: brand.businessInfo
        ? {
            type: brand.businessInfo.type,
            name: brand.businessInfo.name,
            licenseNumber: brand.businessInfo.licenseNumber,
            ceoName: brand.businessInfo.ceoName,
            licenseFileUrl: brand.businessInfo.licenseFileUrl,
          }
        : null,
      bankInfo: brand.bankInfo
        ? {
            name: brand.bankInfo.name,
            accountNumber: brand.bankInfo.accountNumber,
            accountHolder: brand.bankInfo.accountHolder,
          }
        : null,
      brandManagers: brand.brandManagers?.map(manager => ({
        id: manager.id,
        email: manager.email,
        name: manager.name,
        phoneNumber: manager.phoneNumber,
        role: manager.role,
        createdAt: manager.createdAt,
      })),
      createdAt: brand.createdAt,
    };
  }

  @MessagePattern('backoffice.brand.register')
  @Transactional
  async register(data: RegisterBrandInput): Promise<Brand> {
    const brand = await this.brandService.register(data);
    return this.formatBrandResponse(brand);
  }

  @MessagePattern('backoffice.brand.findAll')
  async findAll(): Promise<Brand[]> {
    const brands = await this.brandService.findAll();
    return brands.map(brand => this.formatBrandResponse(brand));
  }

  @MessagePattern('backoffice.brand.findById')
  async findById(data: FindBrandByIdInput): Promise<Brand> {
    const brand = await this.brandService.findById(data.id);
    return this.formatBrandResponse(brand);
  }

  @MessagePattern('backoffice.brand.update')
  @Transactional
  async update(data: UpdateBrandInput): Promise<Brand> {
    const brand = await this.brandService.update(data);
    return this.formatBrandResponse(brand);
  }

  @MessagePattern('backoffice.brand.delete')
  @Transactional
  async delete(data: DeleteBrandInput): Promise<{ success: boolean }> {
    await this.brandService.delete(data);
    return { success: true };
  }

  @MessagePattern('backoffice.brand.createManager')
  @Transactional
  async createManager(
    data: CreateBrandManagerInput
  ): Promise<CreateBrandManagerOutput> {
    const manager = await this.brandService.createManager(data);
    return createBrandManagerOutputSchema.parse(manager);
  }

  @MessagePattern('backoffice.brand.findManagers')
  async findManagers(data: FindBrandManagersInput) {
    const managers = await this.brandService.findManagers(data.brandId);
    return brandManagerListSchema.parse(managers);
  }

  @MessagePattern('backoffice.brand.deleteManager')
  @Transactional
  async deleteManager(
    data: DeleteBrandManagerInput
  ): Promise<{ success: boolean }> {
    return this.brandService.deleteManager(data.id, data.brandId);
  }

  @MessagePattern('backoffice.brand.findManagerById')
  async findManagerById(
    data: FindBrandManagerByIdInput
  ): Promise<BrandManagerProfile> {
    const manager = await this.brandService.findManagerById(data.id);
    return brandManagerProfileSchema.parse({
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phoneNumber: manager.phoneNumber,
      role: manager.role,
      partnerType: 'BRAND' as const,
      partnerId: manager.brand.id,
    });
  }
}
