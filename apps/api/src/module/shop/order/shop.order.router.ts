import { Router, Mutation, Query, Input } from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
  getTmpOrderInputSchema,
  getTmpOrderOutputSchema,
} from './shop.order.schema';
import type { CreateHotelOrderInput, GetTmpOrderInput } from './shop.order.dto';

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
}
