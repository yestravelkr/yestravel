import { Injectable, Logger } from '@nestjs/common';
import type {
  ShopPaymentCompleteInput,
  ShopPaymentCompleteOutput,
} from './shop.payment.type';

@Injectable()
export class ShopPaymentService {
  private readonly logger = new Logger(ShopPaymentService.name);

  async handlePaymentComplete(
    data: ShopPaymentCompleteInput
  ): Promise<ShopPaymentCompleteOutput> {
    this.logger.log('Payment complete webhook received');
    this.logger.log(JSON.stringify(data, null, 2));

    // TODO: 결제 완료 로직 구현
    // 1. Purchase 생성
    // 2. PurchaseLog 생성
    // 3. Order 상태 업데이트

    return {
      success: true,
      message: 'Payment webhook processed',
    };
  }
}
