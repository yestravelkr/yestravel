import { MessagePattern } from '@nestjs/microservices';
import { BackofficeAuthService } from '@src/module/backoffice/auth/backoffice.auth.service';
import { Controller } from '@nestjs/common';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

@Controller()
export class BackofficeAuthController {
  constructor(
    private readonly backofficeAuthService: BackofficeAuthService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.auth.register')
  @Transactional
  async register(data: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;

    role: string;
  }): Promise<{ message: string }> {
    const { email, password, name, phoneNumber, role } = data;
    await this.backofficeAuthService.register(
      email,
      password,
      name,
      phoneNumber,
      role
    );

    // 현재는 단순히 성공 메시지를 반환합니다.
    return { message: '회원가입이 완료되었습니다.' };
  }

  @MessagePattern('backoffice.auth.login')
  async login(data: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = data;
    return this.backofficeAuthService.login(email, password);
  }

  @MessagePattern('backoffice.auth.refresh')
  async refresh(data: {
    refreshToken: string;
  }): Promise<{ accessToken: string }> {
    const { refreshToken } = data;
    return this.backofficeAuthService.refreshToken(refreshToken);
  }

  @MessagePattern('partner.auth.login')
  async partnerLogin(data: {
    email: string;
    password: string;
    partnerType: 'BRAND' | 'INFLUENCER';
  }): Promise<{ accessToken: string; refreshToken: string }> {
    return this.backofficeAuthService.partnerLogin(
      data.email,
      data.password,
      data.partnerType
    );
  }

  @MessagePattern('partner.auth.refresh')
  async partnerRefresh(data: {
    refreshToken: string;
  }): Promise<{ accessToken: string }> {
    return this.backofficeAuthService.partnerRefreshToken(data.refreshToken);
  }
}
