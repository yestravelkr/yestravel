import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  Router,
  Query,
  Mutation,
  Ctx,
  Input,
  UseMiddlewares,
} from 'nestjs-trpc-v2';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  createAdditionalPaymentInputSchema,
  createAdditionalPaymentResponseSchema,
  findByOrderIdInputSchema,
  findByOrderIdResponseSchema,
  cancelAdditionalPaymentInputSchema,
  cancelAdditionalPaymentResponseSchema,
} from './additional-payment.schema';

@Router({ alias: 'backofficeAdditionalPayment' })
export class AdditionalPaymentRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createAdditionalPaymentInputSchema,
    output: createAdditionalPaymentResponseSchema,
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof createAdditionalPaymentInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeAdditionalPayment.create',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findByOrderIdInputSchema,
    output: findByOrderIdResponseSchema,
  })
  async findByOrderId(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findByOrderIdInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeAdditionalPayment.findByOrderId',
      input
    );
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: cancelAdditionalPaymentInputSchema,
    output: cancelAdditionalPaymentResponseSchema,
  })
  async cancel(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof cancelAdditionalPaymentInputSchema>
  ) {
    return this.microserviceClient.send(
      'backofficeAdditionalPayment.cancel',
      input
    );
  }
}
