import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { ShopAuthService } from './shop.auth.service';
import {
  RequestVerificationInput,
  RequestVerificationOutput,
  VerifyCodeInput,
  VerifyCodeOutput,
  SocialLoginInput,
  RefreshTokenOutput,
  MemberDto,
  UpdateMemberInput,
  UpdateMemberOutput,
  LinkSocialAccountInput,
  LinkSocialAccountOutput,
} from './shop.auth.dto';
import { SocialProviderEnumType } from './shop.auth.schema';

@Controller()
export class ShopAuthController {
  constructor(
    private readonly shopAuthService: ShopAuthService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('shop.auth.requestVerification')
  async requestVerification(
    data: RequestVerificationInput
  ): Promise<RequestVerificationOutput> {
    return this.shopAuthService.requestVerification(data.phoneNumber);
  }

  @MessagePattern('shop.auth.verifyCode')
  @Transactional
  async verifyCode(data: VerifyCodeInput): Promise<VerifyCodeOutput> {
    return this.shopAuthService.verifyCode(data.phoneNumber, data.code);
  }

  @MessagePattern('shop.auth.socialLogin')
  @Transactional
  async socialLogin(
    data: SocialLoginInput
  ): Promise<{ accessToken: string; refreshToken: string; isNewMember: boolean }> {
    return this.shopAuthService.socialLogin(
      data.provider as SocialProviderEnumType,
      data.code,
      data.redirectUri
    );
  }

  @MessagePattern('shop.auth.refresh')
  async refresh(data: { refreshToken: string }): Promise<RefreshTokenOutput> {
    return this.shopAuthService.refreshToken(data.refreshToken);
  }

  @MessagePattern('shop.auth.me')
  async me(data: { memberId: number }): Promise<MemberDto> {
    return this.shopAuthService.getMe(data.memberId);
  }

  @MessagePattern('shop.auth.updateMe')
  @Transactional
  async updateMe(
    data: UpdateMemberInput & { memberId: number }
  ): Promise<UpdateMemberOutput> {
    return this.shopAuthService.updateMe(data.memberId, {
      name: data.name ?? undefined,
      email: data.email ?? undefined,
      address: data.address ?? undefined,
    });
  }

  @MessagePattern('shop.auth.linkSocialAccount')
  @Transactional
  async linkSocialAccount(
    data: LinkSocialAccountInput & { memberId: number }
  ): Promise<LinkSocialAccountOutput> {
    return this.shopAuthService.linkSocialAccount(
      data.memberId,
      data.provider as SocialProviderEnumType,
      data.code,
      data.redirectUri
    );
  }
}
