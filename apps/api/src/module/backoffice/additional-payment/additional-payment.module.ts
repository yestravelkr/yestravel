import { Module } from '@nestjs/common';
import { OrderHistoryModule } from '@src/module/backoffice/order/order-history.module';
import { AdditionalPaymentService } from './additional-payment.service';
import { AdditionalPaymentController } from './additional-payment.controller';

@Module({
  imports: [OrderHistoryModule],
  controllers: [AdditionalPaymentController],
  providers: [AdditionalPaymentService],
  exports: [AdditionalPaymentService],
})
export class AdditionalPaymentModule {}
