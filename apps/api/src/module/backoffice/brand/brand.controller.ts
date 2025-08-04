import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BrandService } from '@src/module/backoffice/brand/brand.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { 
  type Brand,
  type RegisterBrandInput,
  type FindBrandByIdInput
} from '@yestravelkr/api-types';

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
      businessInfo: brand.businessInfo ? {
        type: brand.businessInfo.type,
        name: brand.businessInfo.name,
        licenseNumber: brand.businessInfo.licenseNumber,
        ceoName: brand.businessInfo.ceoName
      } : null,
      bankInfo: brand.bankInfo ? {
        name: brand.bankInfo.name,
        accountNumber: brand.bankInfo.accountNumber,
        accountHolder: brand.bankInfo.accountHolder
      } : null,
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
  async findById(data: FindBrandByIdInput): Promise<Brand | null> {
    const brand = await this.brandService.findById(data.id);
    
    if (!brand) {
      return null;
    }
    
    return this.formatBrandResponse(brand);
  }
}