import { Router, Mutation, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { ConfigProvider } from '@src/config';
import {
  requestVerificationSchema,
  verifyCodeSchema,
} from './shop.auth.schema';
import type {
  RequestVerificationResponse,
  TokenResponse,
  TokenGenerationResult,
} from './shop.auth.dto';

/** refreshToken 쿠키 만료 시간 (7일) */
const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

/**
 * ShopAuthRouter - Shop 인증 tRPC 라우터
 *
 * SMS 인증을 통한 로그인/회원가입 엔드포인트를 제공합니다.
 * refreshToken은 httpOnly 쿠키로 관리됩니다.
 */
@Router({ alias: 'shopAuth' })
@Injectable()
export class ShopAuthRouter extends BaseTrpcRouter {
  /**
   * 인증번호 요청
   * 휴대폰 번호로 인증번호를 발송합니다.
   */
  @Mutation({
    input: requestVerificationSchema,
    output: z.object({
      id: z.number(),
      phone: z.string(),
      expiresAt: z.date(),
      code: z.string().optional(), // 개발환경에서만 노출
    }),
  })
  async requestVerification(
    @Input() input: z.infer<typeof requestVerificationSchema>
  ): Promise<RequestVerificationResponse> {
    return this.microserviceClient.send('shopAuth.requestVerification', input);
  }

  /**
   * 인증번호 확인
   * 인증번호를 검증하고 토큰을 발급합니다.
   * refreshToken은 httpOnly 쿠키로 설정됩니다.
   */
  @Mutation({
    input: verifyCodeSchema,
    output: z.object({
      accessToken: z.string(),
      member: z.object({
        id: z.number(),
        phone: z.string(),
        name: z.string().nullable(),
      }),
    }),
  })
  async verifyCode(
    @Input() input: z.infer<typeof verifyCodeSchema>,
    @Ctx() ctx: any
  ): Promise<TokenResponse> {
    const result: TokenGenerationResult = await this.microserviceClient.send(
      'shopAuth.verifyCode',
      input
    );

    // refreshToken을 httpOnly 쿠키로 설정
    ctx.res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: ConfigProvider.stage === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return {
      accessToken: result.accessToken,
      member: result.member,
    };
  }

  /**
   * 토큰 갱신
   * 쿠키의 Refresh Token으로 새 Access Token을 발급합니다.
   */
  @Mutation({
    output: z.object({
      accessToken: z.string(),
      member: z.object({
        id: z.number(),
        phone: z.string(),
        name: z.string().nullable(),
      }),
    }),
  })
  async refreshToken(@Ctx() ctx: any): Promise<TokenResponse> {
    const refreshToken = ctx.req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Refresh token not found',
      });
    }

    const result: TokenGenerationResult = await this.microserviceClient.send(
      'shopAuth.refreshToken',
      refreshToken
    );

    // 새 refreshToken을 httpOnly 쿠키로 갱신
    ctx.res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: ConfigProvider.stage === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    return {
      accessToken: result.accessToken,
      member: result.member,
    };
  }
}
