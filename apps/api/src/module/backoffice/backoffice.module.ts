import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';
import { CampaignModule } from '@src/module/backoffice/campaign/campaign.module';
import { AdminModule } from '@src/module/backoffice/admin/admin.module';
import { ProductTemplateModule } from '@src/module/backoffice/product-template/product-template.module';
import { CategoryModule } from '@src/module/backoffice/category/category.module';

@Module({
  imports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
    CategoryModule,
  ],
  exports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
    CategoryModule,
  ],
})
export class BackofficeModule {}
