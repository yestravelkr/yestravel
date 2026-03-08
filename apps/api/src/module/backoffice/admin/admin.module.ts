import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PartnerAdminController } from './partner-admin.controller';
import { PartnerAdminService } from './partner-admin.service';

@Module({
  controllers: [AdminController, PartnerAdminController],
  providers: [AdminService, PartnerAdminService],
  exports: [AdminService, PartnerAdminService],
})
export class AdminModule {}
