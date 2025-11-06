import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopPaymentService } from './shop.payment.service';
import type {
  ShopPaymentCompleteInput,
  ShopPaymentCompleteOutput,
} from './shop.payment.type';
import { shopPaymentCompleteOutputSchema } from './shop.payment.schema';

@Controller()
export class ShopPaymentController {
  constructor(private readonly shopPaymentService: ShopPaymentService) {}

  @MessagePattern('shopPayment.complete')
  async complete(
    data: ShopPaymentCompleteInput
  ): Promise<ShopPaymentCompleteOutput> {
    const result = await this.shopPaymentService.handlePaymentComplete(data);
    return shopPaymentCompleteOutputSchema.parse(result);
  }
}
