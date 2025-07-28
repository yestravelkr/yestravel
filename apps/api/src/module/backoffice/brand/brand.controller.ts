import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BrandService } from '@src/module/backoffice/brand/brand.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';

@Controller()
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.brand.register')
  @Transactional
  async register(data: {
    name: string;
    email?: string;
    phoneNumber?: string;
    businessInfo?: {
      type?: string;
      name?: string;
      licenseNumber?: string;
      ceoName?: string;
    };
    bankInfo?: {
      name?: string;
      accountNumber?: string;
      accountHolder?: string;
    };
  }) {
    return this.brandService.register(data);
  }
  
  @MessagePattern('backoffice.brand.findAll')
  async findAll() {
    return this.brandService.findAll();
  }
  
  @MessagePattern('backoffice.brand.findById')
  async findById(data: { id: number }) {
    return this.brandService.findById(data.id);
  }
}