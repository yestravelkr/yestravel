import { Module } from '@nestjs/common';
import { PartnerAuthModule } from '@src/module/partner/auth/partner-auth.module';
import { PartnerAccountModule } from '@src/module/partner/account/partner-account.module';

@Module({
  imports: [PartnerAuthModule, PartnerAccountModule],
  exports: [PartnerAuthModule, PartnerAccountModule],
})
export class PartnerModule {}
