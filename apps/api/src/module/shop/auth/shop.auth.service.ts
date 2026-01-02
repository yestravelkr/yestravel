import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { AlrimtalkService } from '@src/module/shared/alrimtalk/alrimtalk.service';
import { ConfigProvider } from '@src/config';
import { MemberEntity } from '@src/module/backoffice/domain/member.entity';
import {
  SocialProviderEnumType,
  SOCIAL_PROVIDER_ENUM_VALUE,
} from './shop.auth.schema';

import {
  RequestVerificationOutput,
  VerifyCodeOutput,
  SocialLoginOutput,
  RefreshTokenOutput,
  MemberDto,
  UpdateMemberOutput,
  LinkSocialAccountOutput,
} from './shop.auth.dto';

/**
 * 인증 관련 상수
 */
const VERIFICATION_RESEND_INTERVAL_SECONDS = 60;
const NEW_MEMBER_THRESHOLD_SECONDS = 1;

/**
 * MemberAuthPayload - JWT 토큰 페이로드
 */
export type MemberAuthPayload = {
  id: number;
  phoneNumber: string;
  isGuest: boolean;
};

const jwtService = new JwtService();

/**
 * ShopAuthService - Shop 인증 서비스
 * SMS 인증, 소셜 로그인, 회원 관리 비즈니스 로직
 */
@Injectable()
export class ShopAuthService {
  private readonly logger = new Logger(ShopAuthService.name);

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly alrimtalkService: AlrimtalkService
  ) {}

  // ========== SMS 인증 ==========

  async requestVerification(phoneNumber: string): Promise<RequestVerificationOutput> {
    // 최근 인증 요청 확인 (1분 내 재요청 제한)
    const recentVerification =
      await this.repositoryProvider.PhoneVerificationRepository.findLatestByPhoneNumber(
        phoneNumber
      );

    if (recentVerification) {
      const secondsSinceLastRequest = dayjs().diff(
        dayjs(recentVerification.createdAt),
        'second'
      );
      if (secondsSinceLastRequest < VERIFICATION_RESEND_INTERVAL_SECONDS) {
        throw new BadRequestException('1분 후에 다시 시도해주세요');
      }
    }

    // 인증번호 생성 및 저장
    const verification =
      await this.repositoryProvider.PhoneVerificationRepository.createVerification(
        phoneNumber
      );

    // 알림톡/SMS 발송
    const result = await this.alrimtalkService.sendVerificationCode(
      phoneNumber,
      verification.verificationCode
    );

    if (!result.success) {
      this.logger.error(`SMS 발송 실패: ${phoneNumber}`);
      throw new BadRequestException('인증번호 발송에 실패했습니다');
    }

    return {
      success: true,
      message: '인증번호가 발송되었습니다',
      expiresAt: verification.expiresAt,
    };
  }

  async verifyCode(phoneNumber: string, code: string): Promise<VerifyCodeOutput> {
    const verification =
      await this.repositoryProvider.PhoneVerificationRepository.findLatestByPhoneNumber(
        phoneNumber
      );

    if (!verification) {
      throw new BadRequestException('인증번호를 먼저 요청해주세요');
    }

    if (verification.isVerified) {
      throw new BadRequestException('이미 사용된 인증번호입니다');
    }

    if (verification.isExpired()) {
      throw new BadRequestException('인증번호가 만료되었습니다');
    }

    if (verification.isMaxAttemptReached()) {
      throw new BadRequestException('인증 시도 횟수를 초과했습니다');
    }

    verification.incrementAttempt();

    if (verification.verificationCode !== code) {
      await this.repositoryProvider.PhoneVerificationRepository.save(verification);
      throw new BadRequestException('인증번호가 일치하지 않습니다');
    }

    verification.markAsVerified();
    await this.repositoryProvider.PhoneVerificationRepository.save(verification);

    // 회원 조회 또는 생성
    const member =
      await this.repositoryProvider.MemberRepository.findOrCreateByPhoneNumber(
        phoneNumber
      );

    const isNewMember =
      dayjs().diff(dayjs(member.createdAt), 'second') < NEW_MEMBER_THRESHOLD_SECONDS;

    // JWT 토큰 발급
    const tokens = this.generateTokens(member);

    return {
      accessToken: tokens.accessToken,
      isNewMember,
    };
  }

  // ========== 소셜 로그인 ==========

  async socialLogin(
    provider: SocialProviderEnumType,
    code: string,
    redirectUri: string
  ): Promise<{ accessToken: string; refreshToken: string; isNewMember: boolean }> {
    // OAuth 토큰 교환 및 사용자 정보 조회
    const socialUserInfo = await this.getSocialUserInfo(provider, code, redirectUri);

    // SocialAccount 조회
    const existingSocialAccount =
      await this.repositoryProvider.SocialAccountRepository.findByProviderAndProviderId(
        provider,
        socialUserInfo.providerId
      );

    let member: MemberEntity;
    let isNewMember = false;

    if (existingSocialAccount) {
      // 기존 소셜 계정이 있으면 해당 회원으로 로그인
      member = existingSocialAccount.member;
    } else {
      // 새 회원 생성 (이메일 기반 전화번호 생성 - 임시)
      const tempPhoneNumber = `social_${provider}_${socialUserInfo.providerId}`;
      member = await this.repositoryProvider.MemberRepository.findOrCreateByPhoneNumber(
        tempPhoneNumber
      );

      if (socialUserInfo.email) {
        member.email = socialUserInfo.email;
      }
      if (socialUserInfo.name) {
        member.name = socialUserInfo.name;
      }
      member.convertToMember();
      await this.repositoryProvider.MemberRepository.save(member);

      // 소셜 계정 연동
      await this.repositoryProvider.SocialAccountRepository.linkAccount(
        member.id,
        provider,
        socialUserInfo.providerId,
        socialUserInfo.email
      );

      isNewMember = true;
    }

    const tokens = this.generateTokens(member);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isNewMember,
    };
  }

  // ========== 토큰 갱신 ==========

  async refreshToken(refreshToken: string): Promise<RefreshTokenOutput> {
    let payload: MemberAuthPayload;

    try {
      payload = jwtService.verify(
        refreshToken,
        ConfigProvider.auth.jwt.store.refresh
      );
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }

    // 회원 존재 확인
    const member = await this.repositoryProvider.MemberRepository.findOneBy({
      id: payload.id,
    });

    if (!member) {
      throw new UnauthorizedException('회원 정보를 찾을 수 없습니다');
    }

    const newPayload: MemberAuthPayload = {
      id: member.id,
      phoneNumber: member.phoneNumber,
      isGuest: member.isGuest,
    };

    const accessToken = jwtService.sign(
      newPayload,
      ConfigProvider.auth.jwt.store.access
    );

    return { accessToken };
  }

  // ========== 회원 정보 ==========

  async getMe(memberId: number): Promise<MemberDto> {
    const member = await this.repositoryProvider.MemberRepository.findOneByOrFail({
      id: memberId,
    }).catch(() => {
      throw new UnauthorizedException('회원 정보를 찾을 수 없습니다');
    });

    return {
      id: member.id,
      phoneNumber: member.phoneNumber,
      name: member.name,
      email: member.email,
      address: member.address,
      isGuest: member.isGuest,
      createdAt: member.createdAt,
    };
  }

  async updateMe(
    memberId: number,
    data: { name?: string; email?: string; address?: any }
  ): Promise<UpdateMemberOutput> {
    const member = await this.repositoryProvider.MemberRepository.findOneByOrFail({
      id: memberId,
    }).catch(() => {
      throw new UnauthorizedException('회원 정보를 찾을 수 없습니다');
    });

    member.update(data);
    await this.repositoryProvider.MemberRepository.save(member);

    return {
      success: true,
      message: '회원 정보가 수정되었습니다',
    };
  }

  // ========== 소셜 계정 연동 ==========

  async linkSocialAccount(
    memberId: number,
    provider: SocialProviderEnumType,
    code: string,
    redirectUri: string
  ): Promise<LinkSocialAccountOutput> {
    const member = await this.repositoryProvider.MemberRepository.findOneByOrFail({
      id: memberId,
    }).catch(() => {
      throw new UnauthorizedException('회원 정보를 찾을 수 없습니다');
    });

    // OAuth 토큰 교환 및 사용자 정보 조회
    const socialUserInfo = await this.getSocialUserInfo(provider, code, redirectUri);

    // 이미 다른 회원에게 연동된 소셜 계정인지 확인
    const existingSocialAccount =
      await this.repositoryProvider.SocialAccountRepository.findByProviderAndProviderId(
        provider,
        socialUserInfo.providerId
      );

    if (existingSocialAccount && existingSocialAccount.memberId !== memberId) {
      throw new BadRequestException('이미 다른 계정에 연동된 소셜 계정입니다');
    }

    if (existingSocialAccount) {
      return {
        success: true,
        message: '이미 연동된 소셜 계정입니다',
      };
    }

    // 소셜 계정 연동
    await this.repositoryProvider.SocialAccountRepository.linkAccount(
      memberId,
      provider,
      socialUserInfo.providerId,
      socialUserInfo.email
    );

    // 비회원 → 회원 전환
    if (member.isGuest) {
      member.convertToMember();
      if (socialUserInfo.email && !member.email) {
        member.email = socialUserInfo.email;
      }
      if (socialUserInfo.name && !member.name) {
        member.name = socialUserInfo.name;
      }
      await this.repositoryProvider.MemberRepository.save(member);
    }

    return {
      success: true,
      message: '소셜 계정이 연동되었습니다',
    };
  }

  // ========== Private Methods ==========

  private generateTokens(member: MemberEntity): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: MemberAuthPayload = {
      id: member.id,
      phoneNumber: member.phoneNumber,
      isGuest: member.isGuest,
    };

    const accessToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.store.access
    );
    const refreshToken = jwtService.sign(
      payload,
      ConfigProvider.auth.jwt.store.refresh
    );

    return { accessToken, refreshToken };
  }

  private async getSocialUserInfo(
    provider: SocialProviderEnumType,
    code: string,
    redirectUri: string
  ): Promise<{ providerId: string; email?: string; name?: string }> {
    const config = ConfigProvider.social?.[provider.toLowerCase() as 'kakao' | 'naver' | 'google'];

    if (!config) {
      throw new BadRequestException(`${provider} 로그인이 설정되지 않았습니다`);
    }

    // OAuth 토큰 교환
    const tokenResponse = await this.exchangeToken(provider, code, redirectUri, config);
    const accessToken = tokenResponse.access_token;

    // 사용자 정보 조회
    const userInfo = await this.fetchUserInfo(provider, accessToken, config);

    return userInfo;
  }

  private async exchangeToken(
    provider: SocialProviderEnumType,
    code: string,
    redirectUri: string,
    config: { clientId: string; clientSecret: string; tokenUrl: string }
  ): Promise<{ access_token: string }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    try {
      const response = await axios.post(config.tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`OAuth token exchange failed for ${provider}`, error);
      throw new BadRequestException('소셜 로그인에 실패했습니다');
    }
  }

  private async fetchUserInfo(
    provider: SocialProviderEnumType,
    accessToken: string,
    config: { userInfoUrl: string }
  ): Promise<{ providerId: string; email?: string; name?: string }> {
    try {
      const response = await axios.get(config.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      switch (provider) {
        case 'KAKAO':
          return {
            providerId: String(response.data.id),
            email: response.data.kakao_account?.email,
            name: response.data.kakao_account?.profile?.nickname,
          };
        case 'NAVER':
          return {
            providerId: response.data.response.id,
            email: response.data.response.email,
            name: response.data.response.name,
          };
        case 'GOOGLE':
          return {
            providerId: response.data.id,
            email: response.data.email,
            name: response.data.name,
          };
        default:
          throw new BadRequestException('지원하지 않는 소셜 로그인입니다');
      }
    } catch (error) {
      this.logger.error(`Fetch user info failed for ${provider}`, error);
      throw new BadRequestException('소셜 로그인에 실패했습니다');
    }
  }
}
