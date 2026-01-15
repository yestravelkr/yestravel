import { Injectable, BadRequestException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigProvider } from '@src/config';
import type {
  KakaoTokenResponse,
  KakaoUserInfo,
  KakaoErrorResponse,
} from './kakao.type';

/**
 * KakaoService - 카카오 OAuth API 통신 서비스
 *
 * 카카오 인증 서버와 통신하여 토큰 발급 및 사용자 정보를 조회합니다.
 *
 * Usage:
 * const kakaoService = new KakaoService();
 * const token = await kakaoService.getToken(code, redirectUri);
 * const userInfo = await kakaoService.getUserInfo(token.access_token);
 */
@Injectable()
export class KakaoService {
  private readonly KAKAO_AUTH_URL = 'https://kauth.kakao.com';
  private readonly KAKAO_API_URL = 'https://kapi.kakao.com';

  /**
   * Authorization Code로 Access Token 발급
   * @param code 카카오 인증 후 받은 Authorization Code
   * @param redirectUri 카카오 앱에 등록한 Redirect URI
   */
  async getToken(
    code: string,
    redirectUri: string
  ): Promise<KakaoTokenResponse> {
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: ConfigProvider.kakao.clientId,
      redirect_uri: redirectUri,
      code,
    };

    // client_secret이 설정된 경우에만 추가
    if (ConfigProvider.kakao.clientSecret) {
      params.client_secret = ConfigProvider.kakao.clientSecret;
    }

    const response = await axios
      .post<KakaoTokenResponse>(
        `${this.KAKAO_AUTH_URL}/oauth/token`,
        new URLSearchParams(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        }
      )
      .catch((error: AxiosError<KakaoErrorResponse>) => {
        const errorData = error.response?.data;

        switch (errorData?.error) {
          case 'invalid_grant':
            throw new BadRequestException(
              '인증 코드가 유효하지 않거나 만료되었습니다'
            );
          case 'invalid_client':
            throw new BadRequestException('카카오 앱 설정이 올바르지 않습니다');
          default:
            throw new BadRequestException(
              errorData?.error_description ?? '카카오 인증에 실패했습니다'
            );
        }
      });

    return response.data;
  }

  /**
   * Access Token으로 사용자 정보 조회
   * @param accessToken 카카오 Access Token
   */
  async getUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const response = await axios
      .get<KakaoUserInfo>(`${this.KAKAO_API_URL}/v2/user/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
      .catch((error: AxiosError<KakaoErrorResponse>) => {
        throw new BadRequestException(
          error.response?.data?.msg ?? '카카오 사용자 정보 조회에 실패했습니다'
        );
      });

    return response.data;
  }

  /**
   * 카카오 전화번호 형식을 한국 형식으로 변환
   * @param kakaoPhone 카카오 전화번호 형식 (+82 10-1234-5678)
   * @returns 한국 전화번호 형식 (01012345678)
   *
   * @example
   * normalizePhoneNumber('+82 10-1234-5678') // '01012345678'
   * normalizePhoneNumber('+82 010-1234-5678') // '01012345678'
   */
  normalizePhoneNumber(kakaoPhone: string): string {
    return kakaoPhone
      .replace(/^\+82\s*/, '0')
      .replace(/-/g, '')
      .trim();
  }
}
