import { Module } from '@nestjs/common';
import { OrderHistoryModule } from '@src/module/backoffice/order/order-history.module';
import { ShopAdditionalPaymentController } from './shop.additional-payment.controller';
import { ShopAdditionalPaymentService } from './shop.additional-payment.service';

@Module({
  imports: [OrderHistoryModule],
  controllers: [ShopAdditionalPaymentController],
  providers: [ShopAdditionalPaymentService],
  exports: [ShopAdditionalPaymentService],
})
export class ShopAdditionalPaymentModule {}
