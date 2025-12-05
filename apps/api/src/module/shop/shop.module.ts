import { Module } from '@nestjs/common';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';

@Module({
  imports: [ShopPaymentModule, ShopProductModule],
  exports: [ShopPaymentModule, ShopProductModule],
})
export class ShopModule {}
