import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
} from './shop.auth.dto';

const jwtService = new JwtService();

/**
 * ShopAuthService - Shop 인증 서비스
 *
 * SMS 인증번호를 통한 비회원 인증을 처리합니다.
 * 휴대폰 번호로 인증번호를 발송하고, 검증 후 JWT 토큰을 발급합니다.
 */
@Injectable()
export class ShopAuthService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 인증번호 요청
   * @param input 휴대폰 번호
   */
  async requestVerification(
    input: RequestVerificationInput
  ): Promise<RequestVerificationResponse> {
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
        ConfigProvider.auth.jwt.store.access
      ),
      refreshToken: jwtService.sign(
        refreshPayload,
        ConfigProvider.auth.jwt.store.refresh
      ),
      member: {
        id: member.id,
        phone: member.phone,
        name: member.name ?? null,
      },
    };
  }
}
