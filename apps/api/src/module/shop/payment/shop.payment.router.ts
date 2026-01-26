import { Router, Mutation, Input } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';

@Router({ alias: 'shopPayment' })
export class ShopPaymentRouter extends BaseTrpcRouter {
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
    }
  ) {
    const output = await this.microserviceClient.send(
      'shopPayment.complete',
      input
    );
    return output;
  }
}
