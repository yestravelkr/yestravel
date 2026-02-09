import { Module } from '@nestjs/common';
import { ShopClaimController } from './shop.claim.controller';
import { ShopClaimService } from './shop.claim.service';

@Module({
  controllers: [ShopClaimController],
  providers: [ShopClaimService],
  exports: [ShopClaimService],
})
export class ShopClaimModule {}
