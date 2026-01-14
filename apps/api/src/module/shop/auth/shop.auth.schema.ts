import { z } from 'zod';

/**
 * Shop Auth Schema
 *
 * B2C 고객용 인증 관련 Zod 스키마 정의
 */

/** 인증번호 요청 스키마 */
export const requestVerificationSchema = z.object({
  phone: z
    .string()
    .regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호를 입력해주세요'),
});

/** 인증번호 확인 스키마 */
export const verifyCodeSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, '인증번호 6자리를 입력해주세요'),
});

/** 토큰 갱신 스키마 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

/** 카카오 로그인 스키마 */
export const kakaoLoginSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  redirectUri: z.string().url('Valid redirect URI is required'),
});
