import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopProductService } from './shop.product.service';

interface GetProductDetailInput {
  influencerProductId: string;
}

interface ProductDetailResponse {
  skus: Array<{
    id: number;
    quantity: number;
    date: string;
  }>;
  hotelOptions: Array<{
    id: number;
    name: string;
    priceByDate: Record<string, number>;
  }>;
}

@Controller()
export class ShopProductController {
  constructor(private readonly shopProductService: ShopProductService) {}

  @MessagePattern('shopProduct.getDetail')
  async getDetail(input: GetProductDetailInput): Promise<ProductDetailResponse> {
    // TODO: Service 로직 구현 후 연결
    return this.shopProductService.getProductDetail(input.influencerProductId);
  }

  // TODO: 상품 목록 조회 메시지 패턴 추가 예정
  // @MessagePattern('shopProduct.findAll')

  // TODO: 상품 검색 메시지 패턴 추가 예정
  // @MessagePattern('shopProduct.search')
}
