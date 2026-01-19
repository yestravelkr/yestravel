import { z } from 'zod';
import {
  requestVerificationSchema,
  verifyCodeSchema,
  kakaoLoginSchema,
  socialLoginResponseSchema,
  completeSocialRegistrationSchema,
} from './shop.auth.schema';
import { SocialProviderEnumType } from '@src/module/backoffice/domain/shop/social-account.entity';

/**
 * Shop Auth DTO
 *
 * B2C 고객용 인증 관련 DTO 정의
 */

/** 인증번호 요청 입력 */
export type RequestVerificationInput = z.infer<
  typeof requestVerificationSchema
>;

/** 인증번호 요청 응답 */
export interface RequestVerificationResponse {
  id: number;
  phone: string;
  expiresAt: Date;
  code?: string; // 개발환경에서만 노출
}

/** 인증번호 확인 입력 */
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;

/** 회원 정보 응답 */
export interface MemberResponse {
  id: number;
  phone: string;
  name: string | null;
}

/** 토큰 응답 */
export interface TokenGenerationResult {
  accessToken: string;
  refreshToken: string;
  member: MemberResponse;
}

/** JWT Payload */
export interface JwtPayload {
  sub: number; // member.id
  type: 'access' | 'refresh';
}

/** 카카오 로그인 입력 */
export type KakaoLoginInput = z.infer<typeof kakaoLoginSchema>;

/** 소셜 로그인 응답 */
export type SocialLoginResult = z.infer<typeof socialLoginResponseSchema>;

/** 소셜 가입 완료 입력 */
export type CompleteSocialRegistrationInput = z.infer<
  typeof completeSocialRegistrationSchema
>;

/** Pending Token Payload */
export interface PendingTokenPayload {
  provider: SocialProviderEnumType;
  providerId: string;
  email?: string;
  name?: string;
}
