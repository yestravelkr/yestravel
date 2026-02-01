import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopOrderService } from './shop.order.service';
import {
  createHotelOrderOutputSchema,
  getTmpOrderOutputSchema,
  updateTmpOrderOutputSchema,
  getOrderDetailOutputSchema,
  getMyOrdersOutputSchema,
} from './shop.order.schema';
import type {
  CreateHotelOrderInput,
  CreateHotelOrderOutput,
  GetTmpOrderInput,
  GetTmpOrderOutput,
  UpdateTmpOrderInput,
  UpdateTmpOrderOutput,
  GetOrderDetailInput,
  GetOrderDetailOutput,
  GetMyOrdersInput,
  GetMyOrdersOutput,
} from './shop.order.dto';

@Controller()
export class ShopOrderController {
  constructor(private readonly shopOrderService: ShopOrderService) {}

  @MessagePattern('shopOrder.createHotelOrder')
  async createHotelOrder(
    input: CreateHotelOrderInput & { memberId: number }
  ): Promise<CreateHotelOrderOutput> {
    const { memberId, ...rest } = input;
    const result = await this.shopOrderService.createHotelOrder(memberId, rest);
    return createHotelOrderOutputSchema.parse(result);
  }

  @MessagePattern('shopOrder.getTmpOrder')
  async getTmpOrder(
    input: GetTmpOrderInput & { memberId: number }
  ): Promise<GetTmpOrderOutput> {
    const { memberId, ...rest } = input;
    const result = await this.shopOrderService.getTmpOrder(memberId, rest);
    return getTmpOrderOutputSchema.parse(result);
  }

  @MessagePattern('shopOrder.updateTmpOrder')
  async updateTmpOrder(
    input: UpdateTmpOrderInput & { memberId: number }
  ): Promise<UpdateTmpOrderOutput> {
    const { memberId, ...rest } = input;
    const result = await this.shopOrderService.updateTmpOrder(memberId, rest);
    return updateTmpOrderOutputSchema.parse(result);
  }

  @MessagePattern('shopOrder.getOrderDetail')
  async getOrderDetail(
    input: GetOrderDetailInput
  ): Promise<GetOrderDetailOutput> {
    const result = await this.shopOrderService.getOrderDetail(input);
    return getOrderDetailOutputSchema.parse(result);
  }

  @MessagePattern('shopOrder.getMyOrders')
  async getMyOrders(
    input: GetMyOrdersInput & { memberId: number }
  ): Promise<GetMyOrdersOutput> {
    const { memberId, ...rest } = input;
    const result = await this.shopOrderService.getMyOrders(memberId, rest);
    return getMyOrdersOutputSchema.parse(result);
  }
}
