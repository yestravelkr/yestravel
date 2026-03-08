import { Module } from '@nestjs/common';
import { PartnerAuthModule } from '@src/module/partner/auth/partner-auth.module';

@Module({
  imports: [PartnerAuthModule],
  exports: [PartnerAuthModule],
})
export class PartnerModule {}
