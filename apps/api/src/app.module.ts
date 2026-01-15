import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { BackofficeModule } from '@src/module/backoffice/backoffice.module';
import { ShopModule } from '@src/module/shop/shop.module';

@Module({
  imports: [SharedModule, BackofficeModule, ShopModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
