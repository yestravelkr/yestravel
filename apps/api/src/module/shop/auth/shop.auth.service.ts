import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ConfigProvider } from '@src/config';
import { MemberEntity } from '@src/module/backoffice/domain/shop/member.entity';
import dayjs from 'dayjs';
import {
  RequestVerificationInput,
  RequestVerificationResponse,
  VerifyCodeInput,
  TokenGenerationResult,
  JwtPayload,
  KakaoLoginInput,
  SocialLoginResult,
  CompleteSocialRegistrationInput,
  PendingTokenPayload,
} from './shop.auth.dto';
import { KakaoService } from './kakao/kakao.service';
import { SocialProviderEnum } from '@src/module/backoffice/domain/shop/social-account.entity';

const jwtService = new JwtService();

/**
 * ShopAuthService - Shop 인증 서비스
 *
 * SMS 인증번호를 통한 비회원 인증을 처리합니다.
 * 휴대폰 번호로 인증번호를 발송하고, 검증 후 JWT 토큰을 발급합니다.
 */
@Injectable()
export class ShopAuthService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly kakaoService: KakaoService
  ) {}

  /**
   * 인증번호 요청
   * @param input 휴대폰 번호
   */
  async requestVerification(
    input: RequestVerificationInput
  ): Promise<RequestVerificationResponse> {
    // 기존 미사용 인증번호 삭제
    await this.repositoryProvider.PhoneVerificationRepository.deleteUnverifiedByPhone(
      input.phone
    );

    const code = this.generateCode();
    const expiresAt = dayjs().add(3, 'minute').toDate();

    const verification =
      await this.repositoryProvider.PhoneVerificationRepository.save({
        phone: input.phone,
        code,
        expiresAt,
      });

    // TODO: SMTNT 알림톡 서비스 연동
    // await this.alrimtalkService.send({
    //   phone: input.phone,
    //   templateCode: 'SHOP_VERIFICATION',
    //   variables: { code },
    // });

    const response: RequestVerificationResponse = {
      id: verification.id,
      phone: verification.phone,
      expiresAt: verification.expiresAt,
    };

    // 개발환경에서만 code 노출
    if (ConfigProvider.stage !== 'production') {
      response.code = code;
    }

    return response;
  }

  /**
   * 인증번호 확인 및 로그인/회원가입
   * @param input 휴대폰 번호, 인증번호
   */
  async verifyCode(input: VerifyCodeInput): Promise<TokenGenerationResult> {
    const verification =
      await this.repositoryProvider.PhoneVerificationRepository.findValidVerification(
        input.phone,
        input.code
      );

    if (!verification || dayjs(verification.expiresAt).isBefore(dayjs())) {
      throw new BadRequestException(
        '인증번호가 올바르지 않거나 만료되었습니다'
      );
    }

    await this.repositoryProvider.PhoneVerificationRepository.markAsVerified(
      verification.id
    );

    // 회원 조회 또는 생성
    const member =
      await this.repositoryProvider.MemberRepository.findOrCreateByPhone(
        input.phone
      );

    return this.generateTokens(member);
  }

  /**
   * 토큰 갱신
   * @param refreshToken 쿠키에서 전달받은 refreshToken
   */
  async refreshToken(refreshToken: string): Promise<TokenGenerationResult> {
    let payload: JwtPayload;

    try {
      payload = jwtService.verify(
        refreshToken,
        ConfigProvider.auth.jwt.store.refresh
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const member = await this.repositoryProvider.MemberRepository.findOne({
      where: { id: payload.sub },
    });

    if (!member) {
      throw new UnauthorizedException('Member not found');
    }

    return this.generateTokens(member);
  }

  /**
   * 카카오 로그인
   * Authorization Code로 카카오 인증 후 JWT 토큰 발급 또는 pendingToken 발급
   * @param input code: Authorization Code, redirectUri: Redirect URI
   */
  async kakaoLogin(input: KakaoLoginInput): Promise<SocialLoginResult> {
    // 1. Authorization Code로 Access Token 발급
    const tokenResponse = await this.kakaoService.getToken(
      input.code,
      input.redirectUri
    );

    // 2. 사용자 정보 조회
    const userInfo = await this.kakaoService.getUserInfo(
      tokenResponse.access_token
    );

    const kakaoId = userInfo.id.toString();
    const name = userInfo.kakao_account?.profile?.nickname ?? null;
    const email = userInfo.kakao_account?.email;

    // 3. 소셜 계정으로 기존 회원 조회
    const existingSocialAccount =
      await this.repositoryProvider.SocialAccountRepository.findByProviderAccount(
        SocialProviderEnum.KAKAO,
        kakaoId
      );

    if (existingSocialAccount) {
      // 이미 연동된 소셜 계정이 있으면 바로 로그인
      return {
        status: 'complete',
        ...this.generateTokens(existingSocialAccount.member),
      };
    }

    // 4. 미연동 → pendingToken 발급
    const pendingToken = this.generatePendingToken({
      provider: SocialProviderEnum.KAKAO,
      providerId: kakaoId,
      email,
      name: name ?? undefined,
    });

    return {
      status: 'pending',
      pendingToken,
      name,
    };
  }

  /**
   * 소셜 가입 완료
   * pendingToken과 SMS 인증을 통해 회원가입 완료
   */
  async completeSocialRegistration(
    input: CompleteSocialRegistrationInput
  ): Promise<TokenGenerationResult> {
    // 1. pendingToken 검증
    const socialInfo = this.verifyPendingToken(input.pendingToken);

    // 2. SMS 인증번호 검증
    const verification =
      await this.repositoryProvider.PhoneVerificationRepository.findValidVerification(
        input.phone,
        input.code
      );

    if (!verification || dayjs(verification.expiresAt).isBefore(dayjs())) {
      throw new BadRequestException(
        '인증번호가 올바르지 않거나 만료되었습니다'
      );
    }

    await this.repositoryProvider.PhoneVerificationRepository.markAsVerified(
      verification.id
    );

    // 3. 회원 조회 또는 생성
    const member =
      await this.repositoryProvider.MemberRepository.findOrCreateByPhone(
        input.phone
      );

    // 4. 이름 없으면 소셜 닉네임으로 설정
    if (!member.name && socialInfo.name) {
      member.name = socialInfo.name;
      await this.repositoryProvider.MemberRepository.save(member);
    }

    // 5. 소셜 계정 연동
    await this.repositoryProvider.SocialAccountRepository.linkAccount(
      member.id,
      socialInfo.provider,
      socialInfo.providerId,
      socialInfo.email
    );

    // 6. JWT 토큰 발급
    return this.generateTokens(member);
  }

  /**
   * 6자리 인증번호 생성 (암호학적으로 안전한 난수 사용)
   */
  private generateCode(): string {
    return randomInt(0, 1000000).toString().padStart(6, '0');
  }

  /**
   * JWT 토큰 생성
   */
  private generateTokens(member: MemberEntity): TokenGenerationResult {
    const accessPayload: JwtPayload = {
      sub: member.id,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: member.id,
      type: 'refresh',
    };

    return {
      accessToken: jwtService.sign(
        accessPayload,
        ConfigProvider.auth.jwt.store.access as JwtSignOptions
      ),
      refreshToken: jwtService.sign(
        refreshPayload,
        ConfigProvider.auth.jwt.store.refresh as JwtSignOptions
      ),
      member: {
        id: member.id,
        phone: member.phone,
        name: member.name ?? null,
      },
    };
  }

  /**
   * Pending Token 생성 (소셜 로그인 후 SMS 인증 대기용)
   * 5분 만료
   */
  private generatePendingToken(payload: PendingTokenPayload): string {
    return jwtService.sign(payload, {
      secret: ConfigProvider.auth.jwt.store.access.secret,
      expiresIn: '5m',
    });
  }

  /**
   * Pending Token 검증
   */
  private verifyPendingToken(token: string): PendingTokenPayload {
    try {
      return jwtService.verify(token, {
        secret: ConfigProvider.auth.jwt.store.access.secret,
      });
    } catch {
      throw new BadRequestException(
        '인증 세션이 만료되었습니다. 다시 로그인해주세요.'
      );
    }
  }
}
