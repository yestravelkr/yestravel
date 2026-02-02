/**
 * ClaimController - 클레임 관리 컨트롤러
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { ClaimService } from './claim.service';
import type { RejectClaimInput, RejectClaimResponse } from './claim.dto';

@Controller()
export class ClaimController {
  constructor(
    private readonly claimService: ClaimService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeClaim.reject')
  @Transactional
  async reject(input: RejectClaimInput): Promise<RejectClaimResponse> {
    return await this.claimService.reject(input);
  }
}
