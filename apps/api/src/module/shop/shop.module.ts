import { Module } from '@nestjs/common';
import { ShopPaymentModule } from './payment/shop.payment.module';

@Module({
  imports: [ShopPaymentModule],
  exports: [ShopPaymentModule],
})
export class ShopModule {}
