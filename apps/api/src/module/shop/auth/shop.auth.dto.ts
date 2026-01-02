import { z } from 'zod';
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
  addressSchema,
} from './shop.auth.schema';

/**
 * Shop Auth DTO 정의
 * 스키마에서 infer된 타입들
 */

// 주소
export type AddressDto = z.infer<typeof addressSchema>;

// 인증번호 요청
export type RequestVerificationInput = z.infer<typeof requestVerificationInputSchema>;
export type RequestVerificationOutput = z.infer<typeof requestVerificationOutputSchema>;

// 인증번호 검증
export type VerifyCodeInput = z.infer<typeof verifyCodeInputSchema>;
export type VerifyCodeOutput = z.infer<typeof verifyCodeOutputSchema>;

// 소셜 로그인
export type SocialLoginInput = z.infer<typeof socialLoginInputSchema>;
export type SocialLoginOutput = z.infer<typeof socialLoginOutputSchema>;

// 토큰 갱신
export type RefreshTokenOutput = z.infer<typeof refreshTokenOutputSchema>;

// 회원 정보
export type MemberDto = z.infer<typeof memberSchema>;

// 회원 정보 수정
export type UpdateMemberInput = z.infer<typeof updateMemberInputSchema>;
export type UpdateMemberOutput = z.infer<typeof updateMemberOutputSchema>;

// 소셜 계정 연동
export type LinkSocialAccountInput = z.infer<typeof linkSocialAccountInputSchema>;
export type LinkSocialAccountOutput = z.infer<typeof linkSocialAccountOutputSchema>;

// 로그아웃
export type LogoutOutput = z.infer<typeof logoutOutputSchema>;
