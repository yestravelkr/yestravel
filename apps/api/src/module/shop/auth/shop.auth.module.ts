import { Module } from '@nestjs/common';
import { ShopAuthController } from './shop.auth.controller';
import { ShopAuthService } from './shop.auth.service';

@Module({
  controllers: [ShopAuthController],
  providers: [ShopAuthService],
  exports: [ShopAuthService],
})
export class ShopAuthModule {}
