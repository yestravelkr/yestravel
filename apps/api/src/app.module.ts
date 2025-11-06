import { Module } from '@nestjs/common';
import { SharedModule } from '@src/module/shared/shared.module';
import { SampleModule } from '@src/module/sample/sample.module';
import { BackofficeModule } from '@src/module/backoffice/backoffice.module';
import { ShopModule } from '@src/module/shop/shop.module';

@Module({
  imports: [SharedModule, SampleModule, BackofficeModule, ShopModule],
  exports: [ShopModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
