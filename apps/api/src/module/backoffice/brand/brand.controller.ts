import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BrandService, RegisterBrandDto } from '@src/module/backoffice/brand/brand.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';

@Controller()
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.brand.register')
  @Transactional
  async register(data: RegisterBrandDto) {
    const brand = await this.brandService.register(data);
    
    return {
      id: brand.id,
      name: brand.name,
      email: brand.email,
      phoneNumber: brand.phoneNumber,
      businessInfo: brand.businessInfo,
      bankInfo: brand.bankInfo,
      createdAt: brand.createdAt,
    };
  }
  
  @MessagePattern('backoffice.brand.findAll')
  async findAll() {
    const brands = await this.brandService.findAll();
    
    return brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      email: brand.email,
      phoneNumber: brand.phoneNumber,
      businessInfo: brand.businessInfo,
      bankInfo: brand.bankInfo,
      createdAt: brand.createdAt,
    }));
  }
  
  @MessagePattern('backoffice.brand.findById')
  async findById(data: { id: number }) {
    const brand = await this.brandService.findById(data.id);
    
    if (!brand) {
      return null;
    }
    
    return {
      id: brand.id,
      name: brand.name,
      email: brand.email,
      phoneNumber: brand.phoneNumber,
      businessInfo: brand.businessInfo,
      bankInfo: brand.bankInfo,
      createdAt: brand.createdAt,
    };
  }
}