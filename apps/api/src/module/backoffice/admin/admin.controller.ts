import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { adminListSchema, adminDetailSchema } from './admin.schema';
import type { AdminList, AdminDetail, FindAdminByIdInput, UpdateAdminInput } from './admin.type';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.admin.findAll')
  async findAll(): Promise<AdminList> {
    const admins = await this.adminService.findAll();
    return adminListSchema.parse(admins);
  }

  @MessagePattern('backoffice.admin.findById')
  async findById(data: FindAdminByIdInput): Promise<AdminDetail | null> {
    const admin = await this.adminService.findById(data.id);
    
    if (!admin) {
      return null;
    }
    
    return adminDetailSchema.parse(admin);
  }

  @MessagePattern('backoffice.admin.update')
  @Transactional
  async update(data: UpdateAdminInput): Promise<AdminDetail> {
    const admin = await this.adminService.update(data);
    return adminDetailSchema.parse(admin);
  }
}