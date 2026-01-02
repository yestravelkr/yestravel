import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { ShopAuthMiddleware, ShopAuthorizedContext } from './shop.auth.middleware';
import {
  requestVerificationInputSchema,
  requestVerificationOutputSchema,
  verifyCodeInputSchema,
  verifyCodeOutputSchema,
  socialLoginInputSchema,
  socialLoginOutputSchema,
  refreshTokenOutputSchema,
  memberSchema,
  updateMemberInputSchema,
  updateMemberOutputSchema,
  linkSocialAccountInputSchema,
  linkSocialAccountOutputSchema,
  logoutOutputSchema,
} from './shop.auth.schema';

/**
 * ShopAuthRouter - Shop 인증 tRPC 라우터
 */
@Router({ alias: 'shopAuth' })
export class ShopAuthRouter extends BaseTrpcRouter {
  // ========== SMS 인증 ==========

  @Mutation({
    input: requestVerificationInputSchema,
    output: requestVerificationOutputSchema,
  })
  async requestVerification(
    @Input() data: z.infer<typeof requestVerificationInputSchema>
  ): Promise<z.infer<typeof requestVerificationOutputSchema>> {
    return this.microserviceClient.send('shop.auth.requestVerification', data);
  }

  @Mutation({
    input: verifyCodeInputSchema,
    output: verifyCodeOutputSchema,
  })
  async verifyCode(
    @Input() data: z.infer<typeof verifyCodeInputSchema>,
    @Ctx() ctx: any
  ): Promise<z.infer<typeof verifyCodeOutputSchema>> {
    const result = await this.microserviceClient.send('shop.auth.verifyCode', data);

    // refreshToken을 쿠키에 저장
    if (result.refreshToken) {
      ctx.res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });
    }

    return {
      accessToken: result.accessToken,
      isNewMember: result.isNewMember,
    };
  }

  // ========== 소셜 로그인 ==========

  @Mutation({
    input: socialLoginInputSchema,
    output: socialLoginOutputSchema,
  })
  async socialLogin(
    @Input() data: z.infer<typeof socialLoginInputSchema>,
    @Ctx() ctx: any
  ): Promise<z.infer<typeof socialLoginOutputSchema>> {
    const result = await this.microserviceClient.send('shop.auth.socialLogin', data);

    // refreshToken을 쿠키에 저장
    ctx.res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });

    return {
      accessToken: result.accessToken,
      isNewMember: result.isNewMember,
    };
  }

  // ========== 토큰 갱신 ==========

  @Mutation({
    output: refreshTokenOutputSchema,
  })
  async refresh(@Ctx() ctx: any): Promise<z.infer<typeof refreshTokenOutputSchema>> {
    const refreshToken = ctx.req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    return this.microserviceClient.send('shop.auth.refresh', { refreshToken });
  }

  // ========== 회원 정보 (인증 필요) ==========

  @UseMiddlewares(ShopAuthMiddleware)
  @Query({
    output: memberSchema,
  })
  async me(@Ctx() ctx: ShopAuthorizedContext): Promise<z.infer<typeof memberSchema>> {
    return this.microserviceClient.send('shop.auth.me', {
      memberId: ctx.member.id,
    });
  }

  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: updateMemberInputSchema,
    output: updateMemberOutputSchema,
  })
  async updateMe(
    @Input() data: z.infer<typeof updateMemberInputSchema>,
    @Ctx() ctx: ShopAuthorizedContext
  ): Promise<z.infer<typeof updateMemberOutputSchema>> {
    return this.microserviceClient.send('shop.auth.updateMe', {
      ...data,
      memberId: ctx.member.id,
    });
  }

  // ========== 소셜 계정 연동 (인증 필요) ==========

  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    input: linkSocialAccountInputSchema,
    output: linkSocialAccountOutputSchema,
  })
  async linkSocialAccount(
    @Input() data: z.infer<typeof linkSocialAccountInputSchema>,
    @Ctx() ctx: ShopAuthorizedContext
  ): Promise<z.infer<typeof linkSocialAccountOutputSchema>> {
    return this.microserviceClient.send('shop.auth.linkSocialAccount', {
      ...data,
      memberId: ctx.member.id,
    });
  }

  // ========== 로그아웃 ==========

  @UseMiddlewares(ShopAuthMiddleware)
  @Mutation({
    output: logoutOutputSchema,
  })
  async logout(@Ctx() ctx: any): Promise<z.infer<typeof logoutOutputSchema>> {
    // refreshToken 쿠키 삭제
    ctx.res.clearCookie('refreshToken');
    return { success: true };
  }
}
