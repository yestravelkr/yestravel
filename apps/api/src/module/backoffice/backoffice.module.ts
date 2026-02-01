import { Module } from '@nestjs/common';
import { BackofficeAuthModule } from '@src/module/backoffice/auth/backoffice.auth.module';
import { BrandModule } from '@src/module/backoffice/brand/brand.module';
import { CampaignModule } from '@src/module/backoffice/campaign/campaign.module';
import { AdminModule } from '@src/module/backoffice/admin/admin.module';
import { ProductTemplateModule } from '@src/module/backoffice/product-template/product-template.module';
import { ProductModule } from '@src/module/backoffice/product/product.module';
import { CategoryModule } from '@src/module/backoffice/category/category.module';
import { InfluencerModule } from '@src/module/backoffice/influencer/influencer.module';
import { OrderModule } from '@src/module/backoffice/order/order.module';
import { SettlementModule } from '@src/module/backoffice/settlement/settlement.module';

@Module({
  imports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
    ProductModule,
    CategoryModule,
    InfluencerModule,
    OrderModule,
    SettlementModule,
  ],
  exports: [
    BackofficeAuthModule,
    BrandModule,
    CampaignModule,
    AdminModule,
    ProductTemplateModule,
    ProductModule,
    CategoryModule,
    InfluencerModule,
    OrderModule,
    SettlementModule,
  ],
})
export class BackofficeModule {}
