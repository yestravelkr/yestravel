import { Module } from '@nestjs/common';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';
import { ShopInfluencerModule } from './influencer/shop.influencer.module';
import { ShopAuthModule } from './auth/shop.auth.module';

@Module({
  imports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule, ShopAuthModule],
  exports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule, ShopAuthModule],
})
export class ShopModule {}
