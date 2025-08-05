import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';
import { CampaignModule } from '@src/module/backoffice/campaign/campaign.module';

@Module({
  imports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
  ],
  exports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
  ],
})
export class BackofficeModule {}