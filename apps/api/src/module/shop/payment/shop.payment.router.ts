import { Router, Mutation, Input, UseMiddlewares, Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';
import {
  ShopAuthMiddleware,
  type ShopAuthorizedContext,
} from '@src/module/shop/auth/shop.auth.middleware';

@Router({ alias: 'shopPayment' })
export class ShopPaymentRouter extends BaseTrpcRouter {
  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: z.object({
      paymentId: z.string(),
      paymentToken: z.string(),
      transactionType: z.string(),
      txId: z.string(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      orderNumber: z.string(),
    }),
  })
  async complete(
    @Input()
    input: {
      paymentId: string;
      paymentToken: string;
      transactionType: string;
      txId: string;
    },
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    const output = await this.microserviceClient.send('shopPayment.complete', {
      memberId: ctx.member.id,
      ...input,
    });
    return output;
  }
}
