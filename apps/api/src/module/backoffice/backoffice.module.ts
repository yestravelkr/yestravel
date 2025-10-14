import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';
import { CampaignModule } from '@src/module/backoffice/campaign/campaign.module';
import { AdminModule } from '@src/module/backoffice/admin/admin.module';

@Module({
  imports: [BackofficeAuthModule, BrandModule, CampaignModule, AdminModule],
  exports: [BackofficeAuthModule, BrandModule, CampaignModule, AdminModule],
})
export class BackofficeModule {}
