import { Module } from '@nestjs/common';
import { ShopOrderController } from './shop.order.controller';
import { ShopOrderService } from './shop.order.service';

@Module({
  controllers: [ShopOrderController],
  providers: [ShopOrderService],
  exports: [ShopOrderService],
})
export class ShopOrderModule {}
