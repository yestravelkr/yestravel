import { Module } from '@nestjs/common';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { ShopPaymentModule } from '@src/module/shop/payment/shop.payment.module';
import { NotificationModule } from '@src/module/shared/notification/notification.module';
import { OrderHistoryModule } from './order-history.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    AwsModule,
    ShopPaymentModule,
    OrderHistoryModule,
    NotificationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
