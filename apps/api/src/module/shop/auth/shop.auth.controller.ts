import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { ShopAuthService } from './shop.auth.service';
import type {
  RequestVerificationInput,
  RequestVerificationResponse,
  VerifyCodeInput,
  TokenGenerationResult,
  KakaoLoginInput,
  SocialLoginResult,
  CompleteSocialRegistrationInput,
} from './shop.auth.dto';

/**
 * ShopAuthController - Shop 인증 컨트롤러
 *
 * tRPC Router에서 전달된 메시지를 처리합니다.
 */
@Controller()
export class ShopAuthController {
  constructor(
    private readonly shopAuthService: ShopAuthService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('shopAuth.requestVerification')
  @Transactional
  async requestVerification(
    input: RequestVerificationInput
  ): Promise<RequestVerificationResponse> {
    return this.shopAuthService.requestVerification(input);
  }

  @MessagePattern('shopAuth.verifyCode')
  @Transactional
  async verifyCode(input: VerifyCodeInput): Promise<TokenGenerationResult> {
    return this.shopAuthService.verifyCode(input);
  }

  @MessagePattern('shopAuth.refreshToken')
  async refreshToken(refreshToken: string): Promise<TokenGenerationResult> {
    return this.shopAuthService.refreshToken(refreshToken);
  }

  @MessagePattern('shopAuth.kakaoLogin')
  @Transactional
  async kakaoLogin(input: KakaoLoginInput): Promise<SocialLoginResult> {
    return this.shopAuthService.kakaoLogin(input);
  }

  @MessagePattern('shopAuth.completeSocialRegistration')
  @Transactional
  async completeSocialRegistration(
    input: CompleteSocialRegistrationInput
  ): Promise<TokenGenerationResult> {
    return this.shopAuthService.completeSocialRegistration(input);
  }
}
