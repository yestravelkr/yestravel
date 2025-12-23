import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopProductService } from './shop.product.service';
import { shopProductDetailSchema } from './shop.product.schema';
import type {
  GetProductDetailInput,
  ProductDetailResponse,
} from './shop.product.dto';

@Controller()
export class ShopProductController {
  constructor(private readonly shopProductService: ShopProductService) {}

  @MessagePattern('shopProduct.getDetail')
  async getDetail(
    input: GetProductDetailInput
  ): Promise<ProductDetailResponse> {
    const result = await this.shopProductService.getProductDetail(input);
    return shopProductDetailSchema.parse(result);
  }
}
