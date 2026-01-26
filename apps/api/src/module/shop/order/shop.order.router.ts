import { Router, Mutation, Query, Input } from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
  getTmpOrderInputSchema,
  getTmpOrderOutputSchema,
  updateTmpOrderInputSchema,
  updateTmpOrderOutputSchema,
  getOrderDetailInputSchema,
  getOrderDetailOutputSchema,
} from './shop.order.schema';
import type {
  CreateHotelOrderInput,
  GetTmpOrderInput,
  UpdateTmpOrderInput,
  GetOrderDetailInput,
} from './shop.order.dto';

@Router({ alias: 'shopOrder' })
@Injectable()
export class ShopOrderRouter extends BaseTrpcRouter {
  @Mutation({
    input: createHotelOrderInputSchema,
    output: createHotelOrderOutputSchema,
  })
  async createHotelOrder(@Input() input: CreateHotelOrderInput) {
    return this.microserviceClient.send('shopOrder.createHotelOrder', input);
  }

  @Query({
    input: getTmpOrderInputSchema,
    output: getTmpOrderOutputSchema,
  })
  async getTmpOrder(@Input() input: GetTmpOrderInput) {
    return this.microserviceClient.send('shopOrder.getTmpOrder', input);
  }

  @Mutation({
    input: updateTmpOrderInputSchema,
    output: updateTmpOrderOutputSchema,
  })
  async updateTmpOrder(@Input() input: UpdateTmpOrderInput) {
    return this.microserviceClient.send('shopOrder.updateTmpOrder', input);
  }

  @Query({
    input: getOrderDetailInputSchema,
    output: getOrderDetailOutputSchema,
  })
  async getOrderDetail(@Input() input: GetOrderDetailInput) {
    return this.microserviceClient.send('shopOrder.getOrderDetail', input);
  }
}
