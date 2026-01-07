import { Module } from '@nestjs/common';
import { ShopAuthController } from './shop.auth.controller';
import { ShopAuthService } from './shop.auth.service';
import { ShopAuthMiddleware } from './shop.auth.middleware';

@Module({
  controllers: [ShopAuthController],
  providers: [ShopAuthService, ShopAuthMiddleware],
  exports: [ShopAuthService, ShopAuthMiddleware],
})
export class ShopAuthModule {}
