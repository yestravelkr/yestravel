import { Module } from '@nestjs/common';
import { PartnerAccountService } from './partner-account.service';
import { PartnerAccountController } from './partner-account.controller';

@Module({
  imports: [],
  controllers: [PartnerAccountController],
  providers: [PartnerAccountService],
  exports: [PartnerAccountService],
})
export class PartnerAccountModule {}
