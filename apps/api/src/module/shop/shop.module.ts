import { Module } from '@nestjs/common';
import { ShopAuthModule } from './auth/shop.auth.module';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';
import { ShopInfluencerModule } from './influencer/shop.influencer.module';
import { ShopOrderModule } from './order/shop.order.module';

@Module({
  imports: [
    ShopAuthModule,
    ShopPaymentModule,
    ShopProductModule,
    ShopInfluencerModule,
    ShopOrderModule,
  ],
  exports: [
    ShopAuthModule,
    ShopPaymentModule,
    ShopProductModule,
    ShopInfluencerModule,
    ShopOrderModule,
  ],
})
export class ShopModule {}
