import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionService: TransactionService
  ) {}

  // TODO: Add message pattern handlers for admin management
}