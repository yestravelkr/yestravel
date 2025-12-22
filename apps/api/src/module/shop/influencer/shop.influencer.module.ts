import { Module } from '@nestjs/common';
import { ShopInfluencerController } from './shop.influencer.controller';
import { ShopInfluencerService } from './shop.influencer.service';

@Module({
  controllers: [ShopInfluencerController],
  providers: [ShopInfluencerService],
  exports: [ShopInfluencerService],
})
export class ShopInfluencerModule {}
