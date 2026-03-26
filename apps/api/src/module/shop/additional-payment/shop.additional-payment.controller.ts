import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopAdditionalPaymentService } from './shop.additional-payment.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  shopAdditionalPaymentGetByTokenOutputSchema,
  shopAdditionalPaymentCompleteOutputSchema,
} from './shop.additional-payment.schema';
import type {
  ShopAdditionalPaymentGetByTokenInput,
  ShopAdditionalPaymentGetByTokenOutput,
  ShopAdditionalPaymentCompleteInput,
  ShopAdditionalPaymentCompleteOutput,
} from './shop.additional-payment.dto';

@Controller()
export class ShopAdditionalPaymentController {
  constructor(
    private readonly shopAdditionalPaymentService: ShopAdditionalPaymentService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('shopAdditionalPayment.getByToken')
  async getByToken(
    data: ShopAdditionalPaymentGetByTokenInput
  ): Promise<ShopAdditionalPaymentGetByTokenOutput> {
    const result = await this.shopAdditionalPaymentService.getByToken(data);
    return shopAdditionalPaymentGetByTokenOutputSchema.parse(result);
  }

  @MessagePattern('shopAdditionalPayment.complete')
  @Transactional
  async complete(
    data: ShopAdditionalPaymentCompleteInput
  ): Promise<ShopAdditionalPaymentCompleteOutput> {
    const result = await this.shopAdditionalPaymentService.complete(data);
    return shopAdditionalPaymentCompleteOutputSchema.parse(result);
  }
}
