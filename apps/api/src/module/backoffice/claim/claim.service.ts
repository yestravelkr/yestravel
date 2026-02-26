/**
 * ClaimService - 클레임 관리 서비스
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { orderNumberParser } from '@src/module/backoffice/domain/order/order.entity';
import { ShopPaymentService } from '@src/module/shop/payment/shop.payment.service';
import type { ClaimEntity } from '@src/module/backoffice/domain/order/claim.entity';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
import type {
  ApproveClaimInput,
  ApproveClaimResponse,
  RejectClaimInput,
  RejectClaimResponse,
  FindByOrderIdInput,
} from './claim.dto';

@Injectable()
export class ClaimService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly shopPaymentService: ShopPaymentService,
    private readonly orderHistoryService: OrderHistoryService
  ) {}

  /**
   * 취소 승인
   * - Claim 상태: REQUESTED → APPROVED
   * - Order 상태: (현재 상태) → CANCELLED
   * - Payment 환불금액 업데이트
   */
  async approve(input: ApproveClaimInput): Promise<ApproveClaimResponse> {
    const { orderId, cancelFee } = input;

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
    claim.detail = { ...claim.detail, cancelFee };

    // 환불금액 계산: originalAmount = sum(item.quantity * item.unitPrice)
    const originalAmount = claim.claimOptionItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const refundAmount = originalAmount - cancelFee;

    await this.repositoryProvider.ClaimRepository.save(claim);

    // 3. 주문 상태 변경: CANCELLED
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문 ${orderId}을 찾을 수 없습니다.`);
    });

    const previousStatus = order.status;
    order.status = 'CANCELLED';
    await this.repositoryProvider.OrderRepository.save(order);

    await this.shopPaymentService.restoreHotelSkuQuantityFromOrder(order);

    // 4. 포트원 결제 취소 API 호출 (실패 시 @Transactional이 DB 롤백)
    const payment = await this.repositoryProvider.PaymentRepository.findOne({
      where: { orderId },
    });

    if (payment) {
      const paymentId = orderNumberParser.encode([orderId], order.createdAt);
      await this.shopPaymentService.cancelPayment(
        paymentId,
        `클레임 승인 - 주문 ${orderId} 취소`,
        refundAmount
      );

      // 5. Payment 환불금액 업데이트 (nowAmount 차감)
      payment.nowAmount = payment.paidAmount - refundAmount;
      await this.repositoryProvider.PaymentRepository.save(payment);

      // TODO: 취소/반품 승인 시 재고 복구 로직 필요 (호텔 날짜별 재고 +1 등)
    }

    // 주문 이력: CANCEL_APPROVED
    await this.orderHistoryService.record({
      orderId,
      previousStatus,
      newStatus: 'CANCELLED',
      actorType: 'ADMIN',
      action: claim.type === 'CANCEL' ? 'CANCEL_APPROVED' : 'RETURN_APPROVED',
      description: `${claim.type === 'CANCEL' ? '취소' : '반품'} 요청이 승인되었습니다.`,
      claimId: claim.id,
      metadata: { cancelFee, refundAmount, claimType: claim.type },
    });

    // 주문 이력: REFUND_PROCESSED
    await this.orderHistoryService.record({
      orderId,
      previousStatus: 'CANCELLED',
      newStatus: 'CANCELLED',
      actorType: 'ADMIN',
      action: 'REFUND_PROCESSED',
      description: `환불이 처리되었습니다. 환불금액: ${refundAmount.toLocaleString()}원`,
      claimId: claim.id,
      metadata: { refundAmount, cancelFee },
    });

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

    await this.repositoryProvider.ClaimRepository.save(claim);

    // 3. 주문 상태 조회 (복원 불필요 - 기존 상태 유지됨)
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문 ${orderId}을 찾을 수 없습니다.`);
    });

    // 주문 이력: CANCEL_REJECTED
    await this.orderHistoryService.record({
      orderId,
      previousStatus: order.status,
      newStatus: order.status,
      actorType: 'ADMIN',
      action: claim.type === 'CANCEL' ? 'CANCEL_REJECTED' : 'RETURN_REJECTED',
      description: `${claim.type === 'CANCEL' ? '취소' : '반품'} 요청이 거절되었습니다.`,
      claimId: claim.id,
      metadata: { claimType: claim.type },
    });

    return {
      success: true,
      orderId,
      newOrderStatus: order.status,
    };
  }

  /**
   * 주문 ID로 클레임 전체 조회 (최신순)
   */
  async findByOrderId(input: FindByOrderIdInput): Promise<ClaimEntity[]> {
    const { orderId } = input;

    return this.repositoryProvider.ClaimRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
