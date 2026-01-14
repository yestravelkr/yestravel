/**
 * 소셜 로그인 유틸리티
 *
 * 다양한 소셜 로그인 제공자를 지원하는 유틸리티입니다.
 * 새로운 제공자 추가 시 SOCIAL_PROVIDERS에 설정을 추가하면 됩니다.
 */

/** 소셜 로그인 제공자 타입 */
export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple';

interface SocialProviderConfig {
  /** OAuth 인증 URL */
  authUrl: string;
  /** 클라이언트 ID 환경변수 키 */
  clientIdEnvKey: string;
  /** 콜백 경로 */
  callbackPath: string;
  /** 추가 파라미터 */
  additionalParams?: Record<string, string>;
}

/** 소셜 로그인 제공자 설정 */
const SOCIAL_PROVIDERS: Record<SocialProvider, SocialProviderConfig> = {
  kakao: {
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientIdEnvKey: 'VITE_KAKAO_CLIENT_ID',
    callbackPath: '/auth/kakao/callback',
  },
  naver: {
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientIdEnvKey: 'VITE_NAVER_CLIENT_ID',
    callbackPath: '/auth/naver/callback',
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientIdEnvKey: 'VITE_GOOGLE_CLIENT_ID',
    callbackPath: '/auth/google/callback',
    additionalParams: {
      scope: 'email profile',
    },
  },
  apple: {
    authUrl: 'https://appleid.apple.com/auth/authorize',
    clientIdEnvKey: 'VITE_APPLE_CLIENT_ID',
    callbackPath: '/auth/apple/callback',
    additionalParams: {
      scope: 'name email',
      response_mode: 'form_post',
    },
  },
};

/**
 * 소셜 로그인 URL 생성
 *
 * @param provider - 소셜 로그인 제공자
 * @param returnUrl - 로그인 완료 후 돌아갈 URL (기본값: 현재 페이지)
 * @returns OAuth 인증 URL
 */
export function buildSocialLoginUrl(
  provider: SocialProvider,
  returnUrl?: string
): string | null {
  const config = SOCIAL_PROVIDERS[provider];
  if (!config) {
    console.error(`Unknown social provider: ${provider}`);
    return null;
  }

  const clientId = import.meta.env[config.clientIdEnvKey];
  if (!clientId) {
    console.error(`Missing env variable: ${config.clientIdEnvKey}`);
    return null;
  }

  const redirectUri = `${window.location.origin}${config.callbackPath}`;
  const state = returnUrl ?? window.location.href;

  const url = new URL(config.authUrl);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  // 추가 파라미터 설정
  if (config.additionalParams) {
    Object.entries(config.additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * 소셜 로그인 실행
 *
 * @param provider - 소셜 로그인 제공자
 * @param returnUrl - 로그인 완료 후 돌아갈 URL
 */
export function redirectToSocialLogin(
  provider: SocialProvider,
  returnUrl?: string
): void {
  const url = buildSocialLoginUrl(provider, returnUrl);

  if (url) {
    window.location.href = url;
  }
}

/**
 * 소셜 로그인 제공자 지원 여부 확인
 *
 * @param provider - 확인할 제공자
 * @returns 지원 여부
 */
export function isSocialProviderSupported(provider: SocialProvider): boolean {
  const config = SOCIAL_PROVIDERS[provider];
  if (!config) return false;

  const clientId = import.meta.env[config.clientIdEnvKey];
  return !!clientId;
}
