import { Module } from '@nestjs/common';
import { ShopPaymentModule } from '@src/module/shop/payment/shop.payment.module';
import { ShopClaimController } from './shop.claim.controller';
import { ShopClaimService } from './shop.claim.service';

@Module({
  imports: [ShopPaymentModule],
  controllers: [ShopClaimController],
  providers: [ShopClaimService],
  exports: [ShopClaimService],
})
export class ShopClaimModule {}
