import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PartnerAdminService } from './partner-admin.service';
import {
  createPartnerManagerOutputSchema,
  partnerManagerListSchema,
  partnerManagerProfileSchema,
  updatePartnerManagerRoleOutputSchema,
} from './partner-admin.schema';
import type {
  CreatePartnerManagerInput,
  FindPartnerManagersInput,
  DeletePartnerManagerInput,
  FindPartnerManagerByIdInput,
  UpdatePartnerManagerRoleInput,
} from './partner-admin.schema';

/**
 * PartnerAdminController - Brand/Influencer 매니저 통합 MessagePattern 컨트롤러
 */
@Controller()
export class PartnerAdminController {
  constructor(private readonly partnerAdminService: PartnerAdminService) {}

  @MessagePattern('partner.admin.createManager')
  async createManager(data: CreatePartnerManagerInput) {
    const manager = await this.partnerAdminService.createManager(data);
    return createPartnerManagerOutputSchema.parse(manager);
  }

  @MessagePattern('partner.admin.findManagers')
  async findManagers(data: FindPartnerManagersInput) {
    const managers = await this.partnerAdminService.findManagers(
      data.partnerType,
      data.partnerId
    );
    return partnerManagerListSchema.parse(managers);
  }

  @MessagePattern('partner.admin.deleteManager')
  async deleteManager(data: DeletePartnerManagerInput) {
    await this.partnerAdminService.deleteManager(
      data.partnerType,
      data.id,
      data.partnerId
    );
  }

  @MessagePattern('partner.admin.findManagerById')
  async findManagerById(data: FindPartnerManagerByIdInput) {
    const { manager, partnerId } =
      await this.partnerAdminService.findManagerById(data.partnerType, data.id);
    return partnerManagerProfileSchema.parse({
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phoneNumber: manager.phoneNumber,
      role: manager.role,
      partnerType: data.partnerType,
      partnerId,
    });
  }

  @MessagePattern('partner.admin.updateManagerRole')
  async updateManagerRole(data: UpdatePartnerManagerRoleInput) {
    const manager = await this.partnerAdminService.updateManagerRole(data);
    return updatePartnerManagerRoleOutputSchema.parse(manager);
  }
}
