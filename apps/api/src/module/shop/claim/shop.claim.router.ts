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
  createClaimInputSchema,
  createClaimOutputSchema,
  getClaimByOrderIdInputSchema,
  getClaimByOrderIdOutputSchema,
  getCancelFeePreviewInputSchema,
  getCancelFeePreviewOutputSchema,
  withdrawClaimInputSchema,
  withdrawClaimOutputSchema,
} from './shop.claim.schema';
import type {
  CreateClaimInput,
  GetClaimByOrderIdInput,
  GetCancelFeePreviewInput,
  WithdrawClaimInput,
} from './shop.claim.dto';
import {
  ShopAuthMiddleware,
  type ShopAuthorizedContext,
} from '@src/module/shop/auth/shop.auth.middleware';

@Router({ alias: 'shopClaim' })
@Injectable()
export class ShopClaimRouter extends BaseTrpcRouter {
  /**
   * 클레임 생성 (취소/반품 요청)
   */
  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: createClaimInputSchema,
    output: createClaimOutputSchema,
  })
  async create(
    @Input() input: Omit<CreateClaimInput, 'memberId'>,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopClaim.create', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  /**
   * 주문 ID로 클레임 조회
   */
  @UseMiddlewares(ShopAuthMiddleware)
  @Query({
    input: getClaimByOrderIdInputSchema,
    output: getClaimByOrderIdOutputSchema,
  })
  async findByOrderId(
    @Input() input: Omit<GetClaimByOrderIdInput, 'memberId'>,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopClaim.findByOrderId', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  /**
   * 취소 수수료 미리보기
   */
  @UseMiddlewares(ShopAuthMiddleware)
  @Query({
    input: getCancelFeePreviewInputSchema,
    output: getCancelFeePreviewOutputSchema,
  })
  async getCancelFeePreview(
    @Input() input: Omit<GetCancelFeePreviewInput, 'memberId'>,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopClaim.getCancelFeePreview', {
      memberId: ctx.member.id,
      ...input,
    });
  }

  /**
   * 취소 철회
   */
  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: withdrawClaimInputSchema,
    output: withdrawClaimOutputSchema,
  })
  async withdraw(
    @Input() input: Omit<WithdrawClaimInput, 'memberId'>,
    @Ctx() ctx: ShopAuthorizedContext
  ) {
    return this.microserviceClient.send('shopClaim.withdraw', {
      memberId: ctx.member.id,
      ...input,
    });
  }
}
