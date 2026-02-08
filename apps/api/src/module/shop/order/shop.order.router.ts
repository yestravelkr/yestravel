import {
  Router,
  Mutation,
  Query,
  Input,
  Ctx,
  UseMiddlewares,
} from 'nestjs-trpc-v2';
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
  getMyOrdersInputSchema,
  getMyOrdersOutputSchema,
} from './shop.order.schema';
import type {
  CreateHotelOrderInput,
  GetTmpOrderInput,
  UpdateTmpOrderInput,
  GetOrderDetailInput,
  GetMyOrdersInput,
} from './shop.order.dto';
import {
  ShopAuthMiddleware,
  type ShopAuthorizedContext,
} from '@src/module/shop/auth/shop.auth.middleware';

@Router({ alias: 'shopOrder' })
@Injectable()
export class ShopOrderRouter extends BaseTrpcRouter {
  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: createHotelOrderInputSchema,
    output: createHotelOrderOutputSchema,
  })
  async createHotelOrder(
    @Input() input: CreateHotelOrderInput,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopOrder.createHotelOrder', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  @UseMiddlewares(ShopAuthMiddleware)
  @Query({
    input: getTmpOrderInputSchema,
    output: getTmpOrderOutputSchema,
  })
  async getTmpOrder(
    @Input() input: GetTmpOrderInput,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopOrder.getTmpOrder', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: updateTmpOrderInputSchema,
    output: updateTmpOrderOutputSchema,
  })
  async updateTmpOrder(
    @Input() input: UpdateTmpOrderInput,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopOrder.updateTmpOrder', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  @Query({
    input: getOrderDetailInputSchema,
    output: getOrderDetailOutputSchema,
  })
  async getOrderDetail(@Input() input: GetOrderDetailInput) {
    return this.microserviceClient.send('shopOrder.getOrderDetail', input);
  }

  @UseMiddlewares(ShopAuthMiddleware)
  @Query({
    input: getMyOrdersInputSchema,
    output: getMyOrdersOutputSchema,
  })
  async getMyOrders(
    @Input() input: GetMyOrdersInput,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopOrder.getMyOrders', {
      memberId: ctx.member.id,
      ...input,
    });
  }
}
