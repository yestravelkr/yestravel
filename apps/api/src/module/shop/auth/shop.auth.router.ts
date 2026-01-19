import { Router, Mutation, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  requestVerificationSchema,
  verifyCodeSchema,
  refreshTokenSchema,
  kakaoLoginSchema,
  tokenResponseSchema,
  socialLoginResponseSchema,
  completeSocialRegistrationSchema,
} from './shop.auth.schema';
import type {
  RequestVerificationResponse,
  TokenGenerationResult,
  SocialLoginResult,
} from './shop.auth.dto';

/**
 * ShopAuthRouter - Shop 인증 tRPC 라우터
 *
 * SMS 인증을 통한 로그인/회원가입 엔드포인트를 제공합니다.
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
   */
  @Mutation({
    input: verifyCodeSchema,
    output: tokenResponseSchema,
  })
  async verifyCode(
    @Input() input: z.infer<typeof verifyCodeSchema>
  ): Promise<TokenGenerationResult> {
    return this.microserviceClient.send('shopAuth.verifyCode', input);
  }

  /**
   * 토큰 갱신
   * Refresh Token으로 새 Access Token을 발급합니다.
   */
  @Mutation({
    input: refreshTokenSchema,
    output: tokenResponseSchema,
  })
  async refreshToken(
    @Input() input: z.infer<typeof refreshTokenSchema>
  ): Promise<TokenGenerationResult> {
    return this.microserviceClient.send(
      'shopAuth.refreshToken',
      input.refreshToken
    );
  }

  /**
   * 카카오 로그인
   * Authorization Code로 카카오 인증 후 토큰 또는 pendingToken을 발급합니다.
   */
  @Mutation({
    input: kakaoLoginSchema,
    output: socialLoginResponseSchema,
  })
  async kakaoLogin(
    @Input() input: z.infer<typeof kakaoLoginSchema>
  ): Promise<SocialLoginResult> {
    return this.microserviceClient.send('shopAuth.kakaoLogin', input);
  }

  /**
   * 소셜 가입 완료
   * pendingToken과 SMS 인증을 통해 회원가입을 완료합니다.
   */
  @Mutation({
    input: completeSocialRegistrationSchema,
    output: tokenResponseSchema,
  })
  async completeSocialRegistration(
    @Input() input: z.infer<typeof completeSocialRegistrationSchema>
  ): Promise<TokenGenerationResult> {
    return this.microserviceClient.send(
      'shopAuth.completeSocialRegistration',
      input
    );
  }
}
