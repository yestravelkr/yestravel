import { z } from 'zod';

/**
 * Shop Auth 스키마 정의
 * SMS 인증, 소셜 로그인, 회원 정보 관련 Zod 스키마
 */

// 소셜 프로바이더 Enum
export const SOCIAL_PROVIDER_ENUM_VALUE = ['KAKAO', 'NAVER', 'GOOGLE'] as const;
export type SocialProviderEnumType = (typeof SOCIAL_PROVIDER_ENUM_VALUE)[number];
export const socialProviderEnumSchema = z.enum(SOCIAL_PROVIDER_ENUM_VALUE);

// 주소 스키마
export const addressSchema = z.object({
  zipCode: z.string(),
  address1: z.string(),
  address2: z.string().nullish(),
});

// ========== 인증번호 요청 ==========
export const requestVerificationInputSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^01[0-9]{8,9}$/, '올바른 전화번호 형식이 아닙니다'),
});

export const requestVerificationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  expiresAt: z.date(),
});

// ========== 인증번호 검증 ==========
export const verifyCodeInputSchema = z.object({
  phoneNumber: z.string(),
  code: z.string().length(6, '인증번호는 6자리입니다'),
});

export const verifyCodeOutputSchema = z.object({
  accessToken: z.string(),
  isNewMember: z.boolean(),
});

// ========== 소셜 로그인 ==========
export const socialLoginInputSchema = z.object({
  provider: socialProviderEnumSchema,
  code: z.string(),
  redirectUri: z.string(),
});

export const socialLoginOutputSchema = z.object({
  accessToken: z.string(),
  isNewMember: z.boolean(),
});

// ========== 토큰 갱신 ==========
export const refreshTokenOutputSchema = z.object({
  accessToken: z.string(),
});

// ========== 회원 정보 ==========
export const memberSchema = z.object({
  id: z.number(),
  phoneNumber: z.string(),
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  address: addressSchema.nullish(),
  isGuest: z.boolean(),
  createdAt: z.date(),
});

// ========== 회원 정보 수정 ==========
export const updateMemberInputSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').nullish(),
  email: z.string().email('올바른 이메일 형식이 아닙니다').nullish(),
  address: addressSchema.nullish(),
});

export const updateMemberOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ========== 소셜 계정 연동 ==========
export const linkSocialAccountInputSchema = z.object({
  provider: socialProviderEnumSchema,
  code: z.string(),
  redirectUri: z.string(),
});

export const linkSocialAccountOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ========== 로그아웃 ==========
export const logoutOutputSchema = z.object({
  success: z.boolean(),
});
