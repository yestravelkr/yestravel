import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ShopClaimService } from './shop.claim.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  createClaimOutputSchema,
  getClaimByOrderIdOutputSchema,
  withdrawClaimOutputSchema,
} from './shop.claim.schema';
import type {
  CreateClaimInput,
  CreateClaimOutput,
  GetClaimByOrderIdInput,
  GetClaimByOrderIdOutput,
  WithdrawClaimInput,
  WithdrawClaimOutput,
} from './shop.claim.dto';

@Controller()
export class ShopClaimController {
  constructor(
    private readonly shopClaimService: ShopClaimService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('shopClaim.create')
  @Transactional
  async create(input: CreateClaimInput): Promise<CreateClaimOutput> {
    const result = await this.shopClaimService.create(input);
    return createClaimOutputSchema.parse(result);
  }

  @MessagePattern('shopClaim.findByOrderId')
  async findByOrderId(
    input: GetClaimByOrderIdInput
  ): Promise<GetClaimByOrderIdOutput> {
    const result = await this.shopClaimService.findByOrderId(input);
    return getClaimByOrderIdOutputSchema.parse(result);
  }

  @MessagePattern('shopClaim.withdraw')
  @Transactional
  async withdraw(input: WithdrawClaimInput): Promise<WithdrawClaimOutput> {
    const result = await this.shopClaimService.withdraw(input);
    return withdrawClaimOutputSchema.parse(result);
  }
}
