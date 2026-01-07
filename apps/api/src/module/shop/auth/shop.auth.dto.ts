import { z } from 'zod';
import {
  requestVerificationSchema,
  verifyCodeSchema,
} from './shop.auth.schema';

/**
 * Shop Auth DTO
 *
 * B2C 고객용 인증 관련 DTO 정의
 */

/** 인증번호 요청 입력 */
export type RequestVerificationInput = z.infer<typeof requestVerificationSchema>;

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

/** 토큰 응답 (accessToken만 body로, refreshToken은 httpOnly 쿠키) */
export interface TokenResponse {
  accessToken: string;
  member: MemberResponse;
}

/** 내부용 토큰 생성 결과 */
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
