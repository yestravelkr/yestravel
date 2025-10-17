import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';
import { CampaignModule } from '@src/module/backoffice/campaign/campaign.module';
import { AdminModule } from '@src/module/backoffice/admin/admin.module';
import { ProductTemplateModule } from '@src/module/backoffice/product-template/product-template.module';

@Module({
  imports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
  ],
  exports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
  ],
})
export class BackofficeModule {}
