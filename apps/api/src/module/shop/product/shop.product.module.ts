import { Module } from '@nestjs/common';
import { ShopProductRouter } from './shop.product.router';
import { ShopProductController } from './shop.product.controller';
import { ShopProductService } from './shop.product.service';

@Module({
  controllers: [ShopProductController],
  providers: [ShopProductService],
  exports: [ShopProductService],
})
export class ShopProductModule {}
