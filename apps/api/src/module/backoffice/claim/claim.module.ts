/**
 * ClaimModule - 클레임 관리 모듈
 */

import { Module } from '@nestjs/common';
import { ShopPaymentModule } from '@src/module/shop/payment/shop.payment.module';
import { OrderHistoryModule } from '@src/module/backoffice/order/order-history.module';
import { ClaimController } from './claim.controller';
import { ClaimService } from './claim.service';

@Module({
  imports: [ShopPaymentModule, OrderHistoryModule],
  controllers: [ClaimController],
  providers: [ClaimService],
  exports: [ClaimService],
})
export class ClaimModule {}
