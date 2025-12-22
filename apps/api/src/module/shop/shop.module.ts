import { Module } from '@nestjs/common';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';
import { ShopInfluencerModule } from './influencer/shop.influencer.module';

@Module({
  imports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule],
  exports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule],
})
export class ShopModule {}
