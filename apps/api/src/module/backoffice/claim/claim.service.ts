/**
 * ClaimService - 클레임 관리 서비스
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type {
  ApproveClaimInput,
  ApproveClaimResponse,
  RejectClaimInput,
  RejectClaimResponse,
  FindByOrderIdInput,
  FindByOrderIdOutput,
} from './claim.dto';

@Injectable()
export class ClaimService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 취소 승인
   * - Claim 상태: REQUESTED → APPROVED
   * - Order 상태: (현재 상태) → CANCELLED
   * - Payment 환불금액 업데이트
   */
  async approve(input: ApproveClaimInput): Promise<ApproveClaimResponse> {
    const { orderId, cancelFee, refundAmount } = input;

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

    // 2. 클레임 상태 및 금액 업데이트
    claim.status = 'APPROVED';
    claim.amount.refund = refundAmount;
    // TODO: history 테이블에 처리 이력 기록

    await this.repositoryProvider.ClaimRepository.save(claim);

    // 3. 주문 상태 변경: CANCELLED
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문 ${orderId}을 찾을 수 없습니다.`);
    });

    order.status = 'CANCELLED';
    await this.repositoryProvider.OrderRepository.save(order);

    // 4. Payment 환불금액 업데이트 (nowAmount 차감)
    const payment = await this.repositoryProvider.PaymentRepository.findOne({
      where: { orderId },
    });

    if (payment) {
      payment.nowAmount = payment.paidAmount - refundAmount;
      await this.repositoryProvider.PaymentRepository.save(payment);
    }

    return {
      success: true,
      orderId,
      newOrderStatus: 'CANCELLED',
      cancelFee,
      refundAmount,
    };
  }

  /**
   * 취소 거절
   * - Claim 상태: REQUESTED → REJECTED
   * - Order 상태는 변경하지 않음 (클레임 생성 시에도 변경하지 않았으므로)
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

    // 3. 주문 상태 조회 (복원 불필요 - 기존 상태 유지됨)
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문 ${orderId}을 찾을 수 없습니다.`);
    });

    return {
      success: true,
      orderId,
      newOrderStatus: order.status,
    };
  }

  /**
   * 주문 ID로 클레임 조회
   */
  async findByOrderId(input: FindByOrderIdInput): Promise<FindByOrderIdOutput> {
    const { orderId } = input;

    const claim = await this.repositoryProvider.ClaimRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    if (!claim) {
      return null;
    }

    return {
      id: claim.id,
      type: claim.type,
      status: claim.status,
      reason: claim.reason.text,
      evidenceUrls: claim.reason.evidenceUrls,
      originalAmount: claim.amount.original,
      refundAmount: claim.amount.refund,
      createdAt: claim.createdAt,
    };
  }
}
