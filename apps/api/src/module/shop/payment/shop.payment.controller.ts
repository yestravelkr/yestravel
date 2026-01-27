import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopPaymentService } from './shop.payment.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import type {
  ShopPaymentCompleteInput,
  ShopPaymentCompleteOutput,
} from './shop.payment.type';
import { shopPaymentCompleteOutputSchema } from './shop.payment.schema';

@Controller()
export class ShopPaymentController {
  constructor(
    private readonly shopPaymentService: ShopPaymentService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('shopPayment.complete')
  @Transactional
  async complete(
    data: ShopPaymentCompleteInput & { memberId: number }
  ): Promise<ShopPaymentCompleteOutput> {
    const result = await this.shopPaymentService.handlePaymentComplete(data);
    return shopPaymentCompleteOutputSchema.parse(result);
  }
}
