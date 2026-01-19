import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopOrderService } from './shop.order.service';
import {
  createHotelOrderOutputSchema,
  getTmpOrderOutputSchema,
} from './shop.order.schema';
import type {
  CreateHotelOrderInput,
  CreateHotelOrderOutput,
  GetTmpOrderInput,
  GetTmpOrderOutput,
} from './shop.order.dto';

@Controller()
export class ShopOrderController {
  constructor(private readonly shopOrderService: ShopOrderService) {}

  @MessagePattern('shopOrder.createHotelOrder')
  async createHotelOrder(
    input: CreateHotelOrderInput
  ): Promise<CreateHotelOrderOutput> {
    const result = await this.shopOrderService.createHotelOrder(input);
    return createHotelOrderOutputSchema.parse(result);
  }

  @MessagePattern('shopOrder.getTmpOrder')
  async getTmpOrder(input: GetTmpOrderInput): Promise<GetTmpOrderOutput> {
    const result = await this.shopOrderService.getTmpOrder(input);
    return getTmpOrderOutputSchema.parse(result);
  }
}
