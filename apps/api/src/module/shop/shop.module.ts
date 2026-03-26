import { Module } from '@nestjs/common';
import { ShopAuthModule } from './auth/shop.auth.module';
import { ShopPaymentModule } from './payment/shop.payment.module';
import { ShopProductModule } from './product/shop.product.module';
import { ShopInfluencerModule } from './influencer/shop.influencer.module';
import { ShopOrderModule } from './order/shop.order.module';
import { ShopClaimModule } from './claim/shop.claim.module';
import { ShopAdditionalPaymentModule } from './additional-payment/shop.additional-payment.module';

@Module({
  imports: [
    ShopAuthModule,
    ShopPaymentModule,
    ShopProductModule,
    ShopInfluencerModule,
    ShopOrderModule,
    ShopClaimModule,
    ShopAdditionalPaymentModule,
  ],
  exports: [
    ShopAuthModule,
    ShopPaymentModule,
    ShopProductModule,
    ShopInfluencerModule,
    ShopOrderModule,
    ShopClaimModule,
    ShopAdditionalPaymentModule,
  ],
})
export class ShopModule {}
