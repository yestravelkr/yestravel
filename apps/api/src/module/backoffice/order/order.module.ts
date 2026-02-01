import { Module } from '@nestjs/common';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [AwsModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
