import { Module } from '@nestjs/common';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';
import { ShopInfluencerModule } from './influencer/shop.influencer.module';
import { ShopOrderModule } from './order/shop.order.module';

@Module({
  imports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule, ShopOrderModule],
  exports: [ShopPaymentModule, ShopProductModule, ShopInfluencerModule, ShopOrderModule],
})
export class ShopModule {}
