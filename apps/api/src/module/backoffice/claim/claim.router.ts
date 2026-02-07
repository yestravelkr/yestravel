/**
 * ClaimRouter - 클레임 관리 tRPC 라우터
 */

import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  Router,
  Mutation,
  Query,
  Ctx,
  Input,
  UseMiddlewares,
} from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  approveClaimInputSchema,
  approveClaimResponseSchema,
  rejectClaimInputSchema,
  rejectClaimResponseSchema,
  findByOrderIdInputSchema,
  findByOrderIdOutputSchema,
} from './claim.schema';

@Router({ alias: 'backofficeClaim' })
@Injectable()
export class ClaimRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: approveClaimInputSchema,
    output: approveClaimResponseSchema,
  })
  async approve(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof approveClaimInputSchema>
  ) {
    return this.microserviceClient.send('backofficeClaim.approve', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: rejectClaimInputSchema,
    output: rejectClaimResponseSchema,
  })
  async reject(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof rejectClaimInputSchema>
  ) {
    return this.microserviceClient.send('backofficeClaim.reject', input);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findByOrderIdInputSchema,
    output: findByOrderIdOutputSchema,
  })
  async findByOrderId(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof findByOrderIdInputSchema>
  ) {
    return this.microserviceClient.send('backofficeClaim.findByOrderId', input);
  }
}
