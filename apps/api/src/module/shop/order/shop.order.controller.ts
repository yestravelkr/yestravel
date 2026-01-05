import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopOrderService } from './shop.order.service';
import { createHotelOrderOutputSchema } from './shop.order.schema';
import type { CreateHotelOrderInput, CreateHotelOrderOutput } from './shop.order.dto';

@Controller()
export class ShopOrderController {
  constructor(private readonly shopOrderService: ShopOrderService) {}

  @MessagePattern('shopOrder.createHotelOrder')
  async createHotelOrder(
    input: CreateHotelOrderInput
  ): Promise<CreateHotelOrderOutput> {
    const tmpOrder = await this.shopOrderService.createHotelOrder(input);
    return createHotelOrderOutputSchema.parse({ orderId: tmpOrder.id });
  }
}
