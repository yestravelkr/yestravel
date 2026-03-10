import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  adminListSchema,
  adminDetailSchema,
  updateAdminPasswordResponseSchema,
  deleteAdminResponseSchema,
} from './admin.schema';
import type {
  AdminList,
  AdminDetail,
  FindAdminByIdInput,
  UpdateAdminInput,
  UpdateAdminPasswordInput,
  UpdateAdminPasswordResponse,
  CreateAdminInput,
  DeleteAdminInput,
  DeleteAdminResponse,
} from './admin.type';

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.admin.create')
  @Transactional
  async create(data: CreateAdminInput): Promise<AdminDetail> {
    const admin = await this.adminService.create(data);
    return adminDetailSchema.parse(admin);
  }

  @MessagePattern('backoffice.admin.findAll')
  async findAll(): Promise<AdminList> {
    const admins = await this.adminService.findAll();
    return adminListSchema.parse(admins);
  }

  @MessagePattern('backoffice.admin.findById')
  async findById(data: FindAdminByIdInput): Promise<AdminDetail> {
    const admin = await this.adminService.findById(data.id);
    return adminDetailSchema.parse(admin);
  }

  @MessagePattern('backoffice.admin.update')
  @Transactional
  async update(data: UpdateAdminInput): Promise<AdminDetail> {
    const admin = await this.adminService.update(data);
    return adminDetailSchema.parse(admin);
  }

  @MessagePattern('backoffice.admin.updatePassword')
  @Transactional
  async updatePassword(
    data: UpdateAdminPasswordInput
  ): Promise<UpdateAdminPasswordResponse> {
    await this.adminService.updatePassword(data);
    const response = {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다',
    };
    return updateAdminPasswordResponseSchema.parse(response);
  }

  @MessagePattern('backoffice.admin.delete')
  @Transactional
  async delete(data: DeleteAdminInput): Promise<DeleteAdminResponse> {
    await this.adminService.delete(data);
    const response = {
      success: true,
      message: '관리자가 성공적으로 삭제되었습니다',
    };
    return deleteAdminResponseSchema.parse(response);
  }
}
