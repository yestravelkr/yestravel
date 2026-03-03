import { Ctx, Input, Mutation, Router } from 'nestjs-trpc-v2';
import { z } from 'zod';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';

// Router에서는 인라인으로 정의 (외부 import 금지)
const PARTNER_TYPE_VALUE = ['BRAND', 'INFLUENCER'] as const;
const partnerTypeSchema = z.enum(PARTNER_TYPE_VALUE);

@Router({ alias: 'partnerAuth' })
export class PartnerAuthRouter extends BaseTrpcRouter {
  @Mutation({
    input: z.object({
      email: z.string().email('이메일 형식이 아닙니다.'),
      password: z.string(),
      partnerType: partnerTypeSchema,
    }),
    output: z.object({ accessToken: z.string() }),
  })
  async login(
    @Input()
    data: {
      email: string;
      password: string;
      partnerType: 'BRAND' | 'INFLUENCER';
    },
    @Ctx() ctx: any
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.microserviceClient.send(
      'partner.auth.login',
      data
    );

    ctx.res.cookie('partnerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
    });
    return { accessToken };
  }

  @Mutation({
    output: z.object({ accessToken: z.string() }),
  })
  async refresh(@Ctx() ctx: any): Promise<{ accessToken: string }> {
    const refreshToken = ctx.req.cookies?.partnerRefreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    return this.microserviceClient.send('partner.auth.refresh', {
      refreshToken,
    });
  }

  @Mutation({
    output: z.object({ success: z.boolean() }),
  })
  async logout(@Ctx() ctx: any): Promise<{ success: boolean }> {
    ctx.res.clearCookie('partnerRefreshToken');
    return { success: true };
  }
}
