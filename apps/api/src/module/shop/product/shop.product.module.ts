import { Module } from '@nestjs/common';
import { ShopProductController } from './shop.product.controller';
import { ShopProductService } from './shop.product.service';
import { ShopInfluencerModule } from '@src/module/shop/influencer/shop.influencer.module';

@Module({
  imports: [ShopInfluencerModule],
  controllers: [ShopProductController],
  providers: [ShopProductService],
  exports: [ShopProductService],
})
export class ShopProductModule {}
