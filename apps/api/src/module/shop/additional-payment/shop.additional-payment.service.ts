import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
import { ShopPaymentService } from '@src/module/shop/payment/shop.payment.service';
import { AdditionalPaymentEntity } from '@src/module/backoffice/domain/order/additional-payment.entity';
import { PaymentEntity } from '@src/module/backoffice/domain/order/payment.entity';
import type {
  ShopAdditionalPaymentGetByTokenInput,
  ShopAdditionalPaymentGetByTokenOutput,
  ShopAdditionalPaymentCompleteInput,
  ShopAdditionalPaymentCompleteOutput,
} from './shop.additional-payment.dto';

type AdditionalPaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'DELETED';

@Injectable()
export class ShopAdditionalPaymentService {
  private readonly logger = new Logger(ShopAdditionalPaymentService.name);

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly shopPaymentService: ShopPaymentService
  ) {}

  /**
   * 토큰으로 추가결제 조회
   *
   * SoftDeleteEntity이므로 withDeleted()로 삭제된 레코드도 포함하여 조회합니다.
   */
  async getByToken(
    input: ShopAdditionalPaymentGetByTokenInput
  ): Promise<ShopAdditionalPaymentGetByTokenOutput> {
    const additionalPayment =
      await this.repositoryProvider.AdditionalPaymentRepository.findOne({
        where: { token: input.token },
        relations: ['payment'],
        withDeleted: true,
      });

    if (!additionalPayment) {
      throw new NotFoundException('추가결제를 찾을 수 없습니다.');
    }

    const status = this.computeStatus(additionalPayment);

    // orderId로 Order 조회하여 orderNumber, productName, customerName 반환
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: additionalPayment.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다. (orderId: ${additionalPayment.orderId})`
      );
    }

    const product = await this.repositoryProvider.ProductRepository.findOne({
      where: { id: order.productId },
      select: ['id', 'name'],
    });

    return {
      id: additionalPayment.id,
      token: additionalPayment.token,
      title: additionalPayment.title,
      amount: additionalPayment.amount,
      reason: additionalPayment.reason,
      status,
      expiresAt: additionalPayment.expiresAt,
      orderId: additionalPayment.orderId,
      orderNumber: order.orderNumber,
      productName: product?.name ?? '상품명 없음',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    };
  }

  /**
   * 추가결제 완료 처리
   *
   * 1. token으로 AdditionalPayment 조회 (PENDING 상태만)
   * 2. PortOne 결제 승인
   * 3. Payment 레코드 생성
   * 4. AdditionalPayment.paymentId 설정
   * 5. Order.totalAmount 갱신
   * 6. OrderHistory 기록
   */
  async complete(
    input: ShopAdditionalPaymentCompleteInput
  ): Promise<ShopAdditionalPaymentCompleteOutput> {
    const { token, paymentId, paymentToken, txId } = input;

    // 1. token으로 AdditionalPayment 조회
    const additionalPayment =
      await this.repositoryProvider.AdditionalPaymentRepository.findOne({
        where: { token },
        relations: ['payment'],
      });

    if (!additionalPayment) {
      throw new NotFoundException('추가결제를 찾을 수 없습니다.');
    }

    const status = this.computeStatus(additionalPayment);
    if (status !== 'PENDING') {
      throw new BadRequestException(
        `결제 가능한 상태가 아닙니다. (현재 상태: ${status})`
      );
    }

    // 2. PortOne 결제 승인 (ALREADY_PAID는 내부에서 에러 없이 처리)
    await this.shopPaymentService.confirmPortonePayment(
      paymentId,
      paymentToken,
      txId
    );

    // 3. 기존 Payment 존재 여부 확인 (이미 결제된 경우 중복 저장 방지)
    const existingPayment =
      await this.repositoryProvider.PaymentRepository.findOne({
        where: { impUid: txId },
      });

    if (existingPayment) {
      this.logger.log(`이미 저장된 Payment 존재. impUid=${txId}`);
      return { success: true, orderNumber: '' };
    }

    // 4. 결제 상세 정보 조회
    const paymentDetail =
      await this.shopPaymentService.getPaymentDetail(paymentId);

    // 결제 상세 조회 실패 시 에러 처리
    if (!paymentDetail || !paymentDetail.amount) {
      throw new BadRequestException(
        `결제 상세 정보를 조회할 수 없습니다. (paymentId: ${paymentId})`
      );
    }

    // 결제 금액 검증
    const paidAmount = paymentDetail.amount.total;
    if (paidAmount !== undefined && paidAmount !== additionalPayment.amount) {
      throw new BadRequestException(
        `결제 금액이 일치하지 않습니다. (요청: ${additionalPayment.amount}원, 실제: ${paidAmount}원)`
      );
    }

    // 5. Payment 저장 (실패해도 결제 승인은 이미 완료된 상태)
    const savedPayment = await this.savePaymentSafely(
      additionalPayment,
      paymentDetail,
      txId
    );

    // Payment 저장 성공 시에만 AdditionalPayment.paymentId 연결 및 Order.totalAmount 갱신
    if (savedPayment) {
      // 6. AdditionalPayment.paymentId 설정
      additionalPayment.paymentId = savedPayment.id;
      await this.repositoryProvider.AdditionalPaymentRepository.save(
        additionalPayment
      );

      // 7. Order.totalAmount 갱신
      const order = await this.repositoryProvider.OrderRepository.findOne({
        where: { id: additionalPayment.orderId },
      });

      if (order) {
        order.totalAmount += additionalPayment.amount;
        await this.repositoryProvider.OrderRepository.save(order);

        // 8. OrderHistory 기록: ADDITIONAL_PAYMENT_COMPLETED
        await this.orderHistoryService.record({
          orderId: order.id,
          previousStatus: order.status,
          newStatus: order.status,
          actorType: 'SYSTEM',
          action: 'ADDITIONAL_PAYMENT_COMPLETED',
          description: `추가결제 완료: ${additionalPayment.title} (${additionalPayment.amount.toLocaleString()}원)`,
          metadata: { additionalPaymentId: additionalPayment.id },
        });

        return { success: true, orderNumber: order.orderNumber };
      }
    }

    return { success: true, orderNumber: '' };
  }

  /**
   * Payment 저장 (실패 시 로깅만 하고 에러를 던지지 않음)
   * - 결제 승인 이후이므로 실패해도 전체 트랜잭션을 롤백하면 안 됨
   * - 대신 로그를 남겨서 수동 복구 가능하도록 함
   */
  private async savePaymentSafely(
    additionalPayment: AdditionalPaymentEntity,
    pgRawData: Record<string, any>,
    txId: string
  ): Promise<PaymentEntity | null> {
    const payment = new PaymentEntity();
    payment.orderId = additionalPayment.orderId;
    payment.paidAt = new Date();
    payment.pgProvider = 'portone';
    payment.pgRawData = pgRawData;
    payment.paidAmount = additionalPayment.amount;
    payment.nowAmount = additionalPayment.amount;
    payment.impUid = txId;

    return this.repositoryProvider.PaymentRepository.save(payment)
      .then((saved) => {
        this.logger.log(`Payment saved: ${saved.id}`);
        return saved;
      })
      .catch((error) => {
        this.logger.error(
          `[CRITICAL] Payment 저장 실패 - 수동 복구 필요. orderId=${additionalPayment.orderId}, txId=${txId}`,
          error
        );
        return null;
      });
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
}
