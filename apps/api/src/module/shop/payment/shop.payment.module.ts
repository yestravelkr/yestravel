import { Module } from '@nestjs/common';
import { OrderHistoryModule } from '@src/module/backoffice/order/order-history.module';
import { ShopPaymentController } from './shop.payment.controller';
import { ShopPaymentService } from './shop.payment.service';

@Module({
  imports: [OrderHistoryModule],
  controllers: [ShopPaymentController],
  providers: [ShopPaymentService],
  exports: [ShopPaymentService],
})
export class ShopPaymentModule {}
