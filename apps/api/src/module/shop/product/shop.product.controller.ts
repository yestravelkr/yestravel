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
}
