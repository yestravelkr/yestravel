/**
 * ClaimController - 클레임 관리 컨트롤러
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { ClaimService } from './claim.service';
import type {
  ApproveClaimInput,
  ApproveClaimResponse,
  RejectClaimInput,
  RejectClaimResponse,
  FindByOrderIdInput,
  FindByOrderIdOutput,
} from './claim.dto';

@Controller()
export class ClaimController {
  constructor(
    private readonly claimService: ClaimService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeClaim.approve')
  @Transactional
  async approve(input: ApproveClaimInput): Promise<ApproveClaimResponse> {
    return await this.claimService.approve(input);
  }

  @MessagePattern('backofficeClaim.reject')
  @Transactional
  async reject(input: RejectClaimInput): Promise<RejectClaimResponse> {
    return await this.claimService.reject(input);
  }

  @MessagePattern('backofficeClaim.findByOrderId')
  async findByOrderId(input: FindByOrderIdInput): Promise<FindByOrderIdOutput> {
    return await this.claimService.findByOrderId(input);
  }
}
