import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SharedModule } from '@src/module/shared/shared.module';
import { BackofficeModule } from '@src/module/backoffice/backoffice.module';
import { ShopModule } from '@src/module/shop/shop.module';
import { PartnerModule } from '@src/module/partner/partner.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SharedModule,
    BackofficeModule,
    ShopModule,
    PartnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
