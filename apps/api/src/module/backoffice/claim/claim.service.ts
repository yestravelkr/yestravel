/**
 * ClaimService - 클레임 관리 서비스
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type { RejectClaimInput, RejectClaimResponse } from './claim.dto';

@Injectable()
export class ClaimService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 취소 거절
   * - Claim 상태: REQUESTED → REJECTED
   * - Order 상태: CANCEL_REQUESTED → previousOrderStatus (복원)
   */
  async reject(input: RejectClaimInput): Promise<RejectClaimResponse> {
    const { orderId } = input;

    // 1. REQUESTED 상태인 클레임 조회
    const claim = await this.repositoryProvider.ClaimRepository.findOne({
      where: { orderId, status: 'REQUESTED' },
      order: { createdAt: 'DESC' },
    });

    if (!claim) {
      throw new NotFoundException(
        `주문 ${orderId}에 대한 취소 요청을 찾을 수 없습니다.`
      );
    }

    // 2. 클레임 상태 업데이트
    claim.status = 'REJECTED';
    // TODO: history 테이블에 처리 이력 기록

    await this.repositoryProvider.ClaimRepository.save(claim);

    // 3. 주문 상태 복원
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문 ${orderId}을 찾을 수 없습니다.`);
    });

    const previousStatus = claim.previousOrderStatus;
    order.status = previousStatus;
    await this.repositoryProvider.OrderRepository.save(order);

    return {
      success: true,
      orderId,
      newOrderStatus: previousStatus,
    };
  }
}
