import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PartnerAccountService } from './partner-account.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import type {
  CreateStaffData,
  DeleteStaffData,
  FindAllStaffData,
  GetProfileData,
} from './partner-account.type';

@Controller()
export class PartnerAccountController {
  constructor(
    private readonly partnerAccountService: PartnerAccountService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('partner.account.createStaff')
  @Transactional
  async createStaff(
    data: CreateStaffData
  ): Promise<{ id: number; email: string }> {
    const manager = await this.partnerAccountService.createStaff(data);
    return { id: manager.id, email: manager.email };
  }

  @MessagePattern('partner.account.findAllStaff')
  async findAllStaff(data: FindAllStaffData) {
    return this.partnerAccountService.findAllStaff(data);
  }

  @MessagePattern('partner.account.deleteStaff')
  @Transactional
  async deleteStaff(data: DeleteStaffData): Promise<{ success: boolean }> {
    return this.partnerAccountService.deleteStaff(data);
  }

  @MessagePattern('partner.account.getProfile')
  async getProfile(data: GetProfileData) {
    return this.partnerAccountService.getProfile(data);
  }
}
