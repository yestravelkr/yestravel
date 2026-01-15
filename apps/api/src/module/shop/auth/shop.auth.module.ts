import { Module } from '@nestjs/common';
import { ShopAuthController } from './shop.auth.controller';
import { ShopAuthService } from './shop.auth.service';
import { KakaoService } from './kakao/kakao.service';

@Module({
  controllers: [ShopAuthController],
  providers: [ShopAuthService, KakaoService],
  exports: [ShopAuthService],
})
export class ShopAuthModule {}
