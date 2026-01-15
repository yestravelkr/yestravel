/**
 * 카카오 토큰 응답 타입
 * POST https://kauth.kakao.com/oauth/token
 */
export interface KakaoTokenResponse {
  /** 액세스 토큰 */
  access_token: string;
  /** 토큰 타입 (bearer) */
  token_type: string;
  /** 리프레시 토큰 */
  refresh_token: string;
  /** 액세스 토큰 만료 시간 (초) */
  expires_in: number;
  /** 접근 허용 범위 */
  scope: string;
  /** 리프레시 토큰 만료 시간 (초) */
  refresh_token_expires_in: number;
}

/**
 * 카카오 사용자 정보 응답 타입
 * GET https://kapi.kakao.com/v2/user/me
 */
export interface KakaoUserInfo {
  /** 카카오 회원번호 */
  id: number;
  /** 서비스 연결 시간 */
  connected_at: string;
  /** 카카오 계정 정보 */
  kakao_account?: {
    /** 프로필 정보 동의 필요 여부 */
    profile_needs_agreement?: boolean;
    /** 프로필 정보 */
    profile?: {
      /** 닉네임 */
      nickname?: string;
      /** 썸네일 이미지 URL */
      thumbnail_image_url?: string;
      /** 프로필 이미지 URL */
      profile_image_url?: string;
    };
    /** 이메일 동의 필요 여부 */
    email_needs_agreement?: boolean;
    /** 이메일 */
    email?: string;
    /** 이메일 유효 여부 */
    is_email_valid?: boolean;
    /** 이메일 인증 여부 */
    is_email_verified?: boolean;
    /** 전화번호 동의 필요 여부 */
    phone_number_needs_agreement?: boolean;
    /** 전화번호 (+82 10-1234-5678 형식) */
    phone_number?: string;
    /** 전화번호 보유 여부 */
    has_phone_number?: boolean;
  };
}

/**
 * 카카오 에러 응답 타입
 */
export interface KakaoErrorResponse {
  /** 에러 코드 */
  error: string;
  /** 에러 설명 */
  error_description?: string;
  /** 에러 코드 (API 응답) */
  error_code?: string;
  /** 에러 메시지 (API 응답) */
  msg?: string;
}
