import { Router, Mutation, Query, Input } from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  shopAdditionalPaymentGetByTokenInputSchema,
  shopAdditionalPaymentGetByTokenOutputSchema,
  shopAdditionalPaymentCompleteInputSchema,
  shopAdditionalPaymentCompleteOutputSchema,
} from './shop.additional-payment.schema';
import type {
  ShopAdditionalPaymentGetByTokenInput,
  ShopAdditionalPaymentCompleteInput,
} from './shop.additional-payment.dto';

/**
 * ShopAdditionalPaymentRouter - 추가결제 Shop tRPC Router
 *
 * 인증 미들웨어를 적용하지 않습니다 (토큰이 인증 역할).
 */
@Router({ alias: 'shopAdditionalPayment' })
export class ShopAdditionalPaymentRouter extends BaseTrpcRouter {
  @Query({
    input: shopAdditionalPaymentGetByTokenInputSchema,
    output: shopAdditionalPaymentGetByTokenOutputSchema,
  })
  async getByToken(@Input() input: ShopAdditionalPaymentGetByTokenInput) {
    return this.microserviceClient.send(
      'shopAdditionalPayment.getByToken',
      input
    );
  }

  @Mutation({
    input: shopAdditionalPaymentCompleteInputSchema,
    output: shopAdditionalPaymentCompleteOutputSchema,
  })
  async complete(@Input() input: ShopAdditionalPaymentCompleteInput) {
    return this.microserviceClient.send(
      'shopAdditionalPayment.complete',
      input
    );
  }
}
