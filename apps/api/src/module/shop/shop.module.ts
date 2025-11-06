import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [PaymentModule],
  exports: [PaymentModule],
})
export class ShopModule {}
