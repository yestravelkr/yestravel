/**
 * ClaimController - 클레임 관리 컨트롤러
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { ClaimService } from './claim.service';
import {
  approveClaimResponseSchema,
  rejectClaimResponseSchema,
  claimDetailSchema,
} from './claim.schema';
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
    const result = await this.claimService.approve(input);
    return approveClaimResponseSchema.parse(result);
  }

  @MessagePattern('backofficeClaim.reject')
  @Transactional
  async reject(input: RejectClaimInput): Promise<RejectClaimResponse> {
    const result = await this.claimService.reject(input);
    return rejectClaimResponseSchema.parse(result);
  }

  @MessagePattern('backofficeClaim.findByOrderId')
  async findByOrderId(input: FindByOrderIdInput): Promise<FindByOrderIdOutput> {
    const claims = await this.claimService.findByOrderId(input);
    return claims.map(claim =>
      claimDetailSchema.parse({
        id: claim.id,
        type: claim.type,
        status: claim.status,
        reason: claim.reason.text,
        evidenceUrls: claim.reason.evidenceUrls,
        claimOptionItems: claim.claimOptionItems,
        cancelFee: claim.detail.cancelFee,
        createdAt: claim.createdAt,
      })
    );
  }
}
