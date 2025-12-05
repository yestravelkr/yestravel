import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopProductService } from './shop.product.service';

@Controller()
export class ShopProductController {
  constructor(private readonly shopProductService: ShopProductService) {}

  // TODO: 상품 목록 조회 메시지 패턴 추가 예정
  // @MessagePattern('shopProduct.findAll')

  // TODO: 상품 상세 조회 메시지 패턴 추가 예정
  // @MessagePattern('shopProduct.findById')

  // TODO: 상품 검색 메시지 패턴 추가 예정
  // @MessagePattern('shopProduct.search')
}
