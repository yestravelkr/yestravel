import { Module } from '@nestjs/common';
import { ShopPaymentController } from './shop.payment.controller';
import { ShopPaymentService } from './shop.payment.service';

@Module({
  controllers: [ShopPaymentController],
  providers: [ShopPaymentService],
  exports: [ShopPaymentService],
})
export class ShopPaymentModule {}
