import { Module } from '@nestjs/common';
import { PartnerAuthService } from './partner-auth.service';
import { PartnerAuthController } from './partner-auth.controller';

@Module({
  imports: [],
  controllers: [PartnerAuthController],
  providers: [PartnerAuthService],
  exports: [PartnerAuthService],
})
export class PartnerAuthModule {}
