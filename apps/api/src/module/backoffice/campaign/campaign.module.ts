import { Module } from '@nestjs/common';
import { CampaignController } from '@src/module/backoffice/campaign/campaign.controller';
import { CampaignService } from '@src/module/backoffice/campaign/campaign.service';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}