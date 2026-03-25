import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { AdditionalPaymentService } from './additional-payment.service';
import type {
  CreateAdditionalPaymentInput,
  CreateAdditionalPaymentResponse,
  FindByOrderIdInput,
  FindByOrderIdResponse,
  CancelAdditionalPaymentInput,
  CancelAdditionalPaymentResponse,
} from './additional-payment.dto';

/**
 * AdditionalPaymentController - 추가결제 관리 컨트롤러
 */
@Controller()
export class AdditionalPaymentController {
  constructor(
    private readonly additionalPaymentService: AdditionalPaymentService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeAdditionalPayment.create')
  @Transactional
  async create(
    input: CreateAdditionalPaymentInput
  ): Promise<CreateAdditionalPaymentResponse> {
    return await this.additionalPaymentService.create(input);
  }

  @MessagePattern('backofficeAdditionalPayment.findByOrderId')
  async findByOrderId(
    input: FindByOrderIdInput
  ): Promise<FindByOrderIdResponse> {
    return await this.additionalPaymentService.findByOrderId(input);
  }

  @MessagePattern('backofficeAdditionalPayment.cancel')
  @Transactional
  async cancel(
    input: CancelAdditionalPaymentInput
  ): Promise<CancelAdditionalPaymentResponse> {
    return await this.additionalPaymentService.cancel(input);
  }
}
