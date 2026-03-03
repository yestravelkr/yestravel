import { MessagePattern } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { PartnerAuthService } from './partner-auth.service';

@Controller()
export class PartnerAuthController {
  constructor(private readonly partnerAuthService: PartnerAuthService) {}

  @MessagePattern('partner.auth.login')
  async login(data: {
    email: string;
    password: string;
    partnerType: 'BRAND' | 'INFLUENCER';
  }): Promise<{ accessToken: string; refreshToken: string }> {
    return this.partnerAuthService.login(
      data.email,
      data.password,
      data.partnerType
    );
  }

  @MessagePattern('partner.auth.refresh')
  async refresh(data: {
    refreshToken: string;
  }): Promise<{ accessToken: string }> {
    return this.partnerAuthService.refreshToken(data.refreshToken);
  }
}
