import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import {
  AdditionalPaymentEntity,
  ADDITIONAL_PAYMENT_EXPIRY_HOURS,
} from '@src/module/backoffice/domain/order/additional-payment.entity';
import { ConfigProvider } from '@src/config';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
import type {
  CreateAdditionalPaymentInput,
  CreateAdditionalPaymentResponse,
  FindByOrderIdInput,
  FindByOrderIdResponse,
  CancelAdditionalPaymentInput,
  CancelAdditionalPaymentResponse,
  AdditionalPaymentStatus,
  AdditionalPaymentItem,
} from './additional-payment.dto';

/**
 * AdditionalPaymentService - 추가결제 관리 서비스
 *
 * 백오피스에서 추가결제 링크를 생성/조회/무효화하는 서비스입니다.
 */
@Injectable()
export class AdditionalPaymentService {
  private readonly SHOP_URL = ConfigProvider.shopUrl;

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly orderHistoryService: OrderHistoryService
  ) {}

  /**
   * 추가결제 생성
   *
   * 1. orderId로 Order 조회
   * 2. 정산 전 검증 (influencerSettlementId, brandSettlementId 모두 null)
   * 3. 주문 CANCELLED 상태 아닌지 검증
   * 4. UUID v4 토큰 생성
   * 5. AdditionalPaymentEntity 생성
   * 6. OrderHistory 기록 (metadata에 additionalPaymentId 저장)
   * 7. Shop URL 반환
   */
  async create(
    input: CreateAdditionalPaymentInput
  ): Promise<CreateAdditionalPaymentResponse> {
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: input.orderId },
      relations: ['payments'],
    });

    if (!order) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다. (orderId: ${input.orderId})`
      );
    }

    // 정산 전 검증
    if (
      order.influencerSettlementId !== null ||
      order.brandSettlementId !== null
    ) {
      throw new BadRequestException(
        '이미 정산이 진행된 주문에는 추가결제를 생성할 수 없습니다.'
      );
    }

    // 주문 CANCELLED 상태 검증
    if (order.status === 'CANCELLED') {
      throw new BadRequestException(
        '취소된 주문에는 추가결제를 생성할 수 없습니다.'
      );
    }

    // UUID v4 토큰 생성
    const token = randomUUID();

    // AdditionalPaymentEntity 생성
    const additionalPayment = new AdditionalPaymentEntity();
    additionalPayment.orderId = input.orderId;
    additionalPayment.token = token;
    additionalPayment.title = input.title;
    additionalPayment.amount = input.amount;
    additionalPayment.reason = input.reason;
    additionalPayment.expiresAt = dayjs()
      .add(ADDITIONAL_PAYMENT_EXPIRY_HOURS, 'hour')
      .toDate();

    const saved =
      await this.repositoryProvider.AdditionalPaymentRepository.save(
        additionalPayment
      );

    // OrderHistory 기록 (metadata에 additionalPaymentId 저장하여 추적)
    await this.orderHistoryService.record({
      orderId: input.orderId,
      previousStatus: order.status,
      newStatus: order.status,
      actorType: 'ADMIN',
      action: 'ADDITIONAL_PAYMENT_REQUESTED',
      description: `추가결제 요청: ${input.title} (${input.amount.toLocaleString()}원) - ${input.reason}`,
      metadata: { additionalPaymentId: saved.id },
    });

    const paymentUrl = `${this.SHOP_URL}/additional-payment/${token}`;

    return {
      additionalPaymentId: saved.id,
      paymentUrl,
    };
  }

  /**
   * 주문별 추가결제 목록 조회
   *
   * orderId FK를 통해 단일 쿼리로 조회합니다.
   */
  async findByOrderId(
    input: FindByOrderIdInput
  ): Promise<FindByOrderIdResponse> {
    const additionalPayments =
      await this.repositoryProvider.AdditionalPaymentRepository.find({
        where: { orderId: input.orderId },
        relations: ['payment'],
        order: { createdAt: 'DESC' },
      });

    return additionalPayments.map(ap =>
      this.toAdditionalPaymentItem(ap, ap.payment ?? null)
    );
  }

  /**
   * 추가결제 무효화
   *
   * PENDING 상태만 무효화 가능합니다.
   */
  async cancel(
    input: CancelAdditionalPaymentInput
  ): Promise<CancelAdditionalPaymentResponse> {
    const additionalPayment =
      await this.repositoryProvider.AdditionalPaymentRepository.findOne({
        where: { id: input.additionalPaymentId },
        relations: ['payment'],
      });

    if (!additionalPayment) {
      throw new NotFoundException(
        `추가결제를 찾을 수 없습니다. (id: ${input.additionalPaymentId})`
      );
    }

    const status = this.computeStatus(additionalPayment);

    if (status !== 'PENDING') {
      throw new BadRequestException(
        `PENDING 상태의 추가결제만 무효화할 수 있습니다. (현재 상태: ${status})`
      );
    }

    // soft delete
    additionalPayment.deletedAt = new Date();
    await this.repositoryProvider.AdditionalPaymentRepository.save(
      additionalPayment
    );

    // OrderHistory 기록 - orderId 직접 참조
    const orderId = additionalPayment.orderId;
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: orderId },
    });

    if (order) {
      await this.orderHistoryService.record({
        orderId,
        previousStatus: order.status,
        newStatus: order.status,
        actorType: 'ADMIN',
        action: 'ADDITIONAL_PAYMENT_CANCELLED',
        description: `추가결제 무효화: ${additionalPayment.title} (${additionalPayment.amount.toLocaleString()}원)`,
        metadata: { additionalPaymentId: additionalPayment.id },
      });
    }

    return {
      success: true,
      additionalPaymentId: input.additionalPaymentId,
    };
  }

  /**
   * 추가결제 상태 계산
   */
  private computeStatus(ap: AdditionalPaymentEntity): AdditionalPaymentStatus {
    if (ap.deletedAt) return 'DELETED';
    if (ap.payment) return 'PAID';
    if (dayjs(ap.expiresAt).isBefore(dayjs())) return 'EXPIRED';
    return 'PENDING';
  }

  /**
   * AdditionalPaymentEntity를 응답 아이템으로 변환
   */
  private toAdditionalPaymentItem(
    ap: AdditionalPaymentEntity,
    payment: { paidAt: Date | null | undefined } | null
  ): AdditionalPaymentItem {
    const status = this.computeStatus(ap);
    return {
      id: ap.id,
      title: ap.title,
      amount: ap.amount,
      reason: ap.reason,
      status,
      paymentUrl:
        status === 'PENDING'
          ? `${this.SHOP_URL}/additional-payment/${ap.token}`
          : null,
      expiresAt: ap.expiresAt,
      createdAt: ap.createdAt,
      paidAt: payment?.paidAt ?? ap.payment?.paidAt ?? null,
    };
  }
}
