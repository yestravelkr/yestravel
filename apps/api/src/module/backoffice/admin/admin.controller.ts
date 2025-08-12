import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { adminListSchema } from './admin.schema';
import type { AdminList } from './admin.type';

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
}