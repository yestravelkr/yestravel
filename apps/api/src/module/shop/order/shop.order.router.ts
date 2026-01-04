import { Router, Mutation, Input } from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
} from './shop.order.schema';
import type { CreateHotelOrderInput } from './shop.order.dto';

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
}
