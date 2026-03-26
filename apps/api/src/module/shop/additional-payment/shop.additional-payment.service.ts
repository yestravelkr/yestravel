import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
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
  private readonly PORTONE_API_URL = 'https://api.portone.io';
  private readonly PORTONE_API_SECRET = ConfigProvider.portone.apiSecret;
  private portoneToken: {
    accessToken: string | null;
    refreshToken: string | null;
    expiredAt: dayjs.Dayjs;
  } = {
    accessToken: null,
    refreshToken: null,
    expiredAt: dayjs().add(-1, 'h'),
  };

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly orderHistoryService: OrderHistoryService
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

    // 2. PortOne 결제 승인
    await this.confirmPortonePayment(paymentId, paymentToken, txId);

    // 결제 상세 정보 조회
    const paymentDetail = await this.getPaymentDetail(paymentId);

    // 결제 금액 검증
    const paidAmount = paymentDetail?.amount?.total;
    if (paidAmount !== undefined && paidAmount !== additionalPayment.amount) {
      throw new BadRequestException(
        `결제 금액이 일치하지 않습니다. (요청: ${additionalPayment.amount}원, 실제: ${paidAmount}원)`
      );
    }

    // 3. Payment 레코드 생성
    const payment = new PaymentEntity();
    payment.orderId = additionalPayment.orderId;
    payment.paidAt = new Date();
    payment.pgProvider = 'portone';
    payment.pgRawData = paymentDetail;
    payment.paidAmount = additionalPayment.amount;
    payment.nowAmount = additionalPayment.amount;
    payment.impUid = txId;

    const savedPayment =
      await this.repositoryProvider.PaymentRepository.save(payment);
    this.logger.log(`Payment saved: ${savedPayment.id}`);

    // 4. AdditionalPayment.paymentId 설정
    additionalPayment.paymentId = savedPayment.id;
    await this.repositoryProvider.AdditionalPaymentRepository.save(
      additionalPayment
    );

    // 5. Order.totalAmount 갱신
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: additionalPayment.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `주문을 찾을 수 없습니다. (orderId: ${additionalPayment.orderId})`
      );
    }

    order.totalAmount += additionalPayment.amount;
    await this.repositoryProvider.OrderRepository.save(order);

    // 6. OrderHistory 기록: ADDITIONAL_PAYMENT_COMPLETED
    await this.orderHistoryService.record({
      orderId: order.id,
      previousStatus: order.status,
      newStatus: order.status,
      actorType: 'SYSTEM',
      action: 'ADDITIONAL_PAYMENT_COMPLETED',
      description: `추가결제 완료: ${additionalPayment.title} (${additionalPayment.amount.toLocaleString()}원)`,
      metadata: { additionalPaymentId: additionalPayment.id },
    });

    return {
      success: true,
      orderNumber: order.orderNumber,
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
   * PortOne 결제 승인
   */
  private async confirmPortonePayment(
    paymentId: string,
    paymentToken: string,
    txId: string
  ): Promise<void> {
    await this.generatePortoneAccessToken();

    return axios
      .post(
        `${this.PORTONE_API_URL}/payments/${paymentId}/confirm`,
        { paymentToken, txId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.portoneToken.accessToken}`,
          },
        }
      )
      .then(() => {
        this.logger.log('Additional payment confirmed successfully');
      })
      .catch((error: any) => {
        if (error.response?.data?.type === 'ALREADY_PAID') {
          this.logger.log('이미 결제된 추가결제 요청은 에러 없이 처리');
          return;
        }
        this.logger.error('Additional payment confirmation failed', error);
        throw error;
      });
  }

  /**
   * PortOne 결제 상세 정보 조회
   */
  private async getPaymentDetail(
    paymentId: string
  ): Promise<Record<string, any>> {
    return axios
      .get(`${this.PORTONE_API_URL}/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${this.portoneToken.accessToken}`,
        },
      })
      .then(response => response.data)
      .catch(error => {
        this.logger.error('Failed to get payment detail', error);
        return {};
      });
  }

  /**
   * PortOne Access Token 생성/갱신
   */
  private async generatePortoneAccessToken(): Promise<void> {
    if (
      this.portoneToken.accessToken &&
      dayjs().isBefore(this.portoneToken.expiredAt)
    ) {
      return;
    }

    const { data } = await axios.post<{
      accessToken: string;
      refreshToken: string;
    }>(`${this.PORTONE_API_URL}/login/api-secret`, {
      apiSecret: this.PORTONE_API_SECRET,
    });

    this.portoneToken = {
      ...data,
      expiredAt: dayjs().add(20, 'minutes'),
    };
    this.logger.log('PortOne access token generated');
  }
}
