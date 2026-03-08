import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PartnerAdminController } from './partner-admin.controller';
import { PartnerAdminService } from './partner-admin.service';
import { PartnerManagerStrategyFactory } from './strategy/partner-manager-strategy.factory';
import { BrandManagerStrategy } from './strategy/brand-manager.strategy';
import { InfluencerManagerStrategy } from './strategy/influencer-manager.strategy';

@Module({
  controllers: [AdminController, PartnerAdminController],
  providers: [
    AdminService,
    PartnerAdminService,
    PartnerManagerStrategyFactory,
    BrandManagerStrategy,
    InfluencerManagerStrategy,
  ],
  exports: [AdminService, PartnerAdminService],
})
export class AdminModule {}
