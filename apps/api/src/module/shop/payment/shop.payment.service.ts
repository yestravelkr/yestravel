import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigProvider } from '@src/config';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import {
  OrderEntity,
  OrderStatusEnum,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { HotelOrderEntity } from '@src/module/backoffice/domain/order/hotel-order.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  ShopPaymentCompleteInput,
  ShopPaymentCompleteOutput,
} from './shop.payment.type';
import { PaymentEntity } from '@src/module/backoffice/domain/order/payment.entity';
import dayjs from 'dayjs';

@Injectable()
export class ShopPaymentService {
  private readonly logger = new Logger(ShopPaymentService.name);
  private readonly PORTONE_API_URL = 'https://api.portone.io';
  private readonly PORTONE_API_SECRET = ConfigProvider.portone.apiSecret;
  private portoneToken: {
    accessToken: string | null;
    refreshToken: string | null;
    expiredAt: dayjs.Dayjs;
  } = {
    accessToken: null,
    refreshToken: null,
    expiredAt: dayjs().add(-1, 'h'), // 처음에 바로 accessToken 발급하도록 처리
  };

  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async handlePaymentComplete(
    data: ShopPaymentCompleteInput & { memberId: number }
  ): Promise<ShopPaymentCompleteOutput> {
    this.logger.log('Payment complete webhook received');
    this.logger.log(JSON.stringify(data, null, 2));

    const { paymentId, memberId } = data;

    // 1. TmpOrder 조회 (paymentId = orderNumber)
    const tmpOrder = await this.getTmpOrderByOrderNumber(paymentId);

    // 2. TmpOrder → Order 변환 (타입별로 적절한 엔티티 사용)
    const order = this.createOrderFromTmpOrder(tmpOrder, memberId);

    // 3. Order 상태를 PAID로 업데이트 및 저장
    order.status = OrderStatusEnum.PAID;
    const savedOrder = await this.saveOrder(order);

    // 4. TmpOrder 삭제 (임시 데이터이므로 hard delete)
    await this.repositoryProvider.TmpOrderRepository.delete({
      id: tmpOrder.id,
    });

    this.logger.log(
      `Order created successfully: id=${savedOrder.id}, orderNumber=${savedOrder.orderNumber}`
    );

    // 마지막. 내부로직 문제 없을 시 PortOne 결제 수동 승인 및 Payment 저장
    await this.confirmPayment(data, savedOrder);

    const resultOrderNumber = savedOrder.orderNumber;
    this.logger.log(`Returning orderNumber: ${resultOrderNumber}`);

    return {
      success: true,
      message: 'Payment completed and order created',
      orderNumber: resultOrderNumber,
    };
  }

  /**
   * orderNumber로 TmpOrder 조회
   */
  private async getTmpOrderByOrderNumber(orderNumber: string) {
    const [orderId] = orderNumberParser.decode(orderNumber);

    if (!orderId) {
      throw new BadRequestException(
        `유효하지 않은 주문번호입니다 (orderNumber: ${orderNumber})`
      );
    }

    const tmpOrder = await this.repositoryProvider.TmpOrderRepository.findOne({
      where: { id: orderId },
    });

    if (!tmpOrder) {
      throw new NotFoundException(
        `임시 주문을 찾을 수 없습니다 (orderNumber: ${orderNumber})`
      );
    }

    return tmpOrder;
  }

  /**
   * Order 저장 (저장된 엔티티 반환)
   */
  private async saveOrder(order: OrderEntity): Promise<OrderEntity> {
    return this.repositoryProvider.OrderRepository.save(order);
  }

  /**
   * TmpOrder → Order 변환 (타입별로 적절한 엔티티 사용)
   */
  private createOrderFromTmpOrder(
    tmpOrder: Awaited<ReturnType<typeof this.getTmpOrderByOrderNumber>>,
    memberId: number
  ): OrderEntity {
    switch (tmpOrder.type) {
      case ProductTypeEnum.HOTEL:
        return HotelOrderEntity.fromHotel(tmpOrder.raw, memberId);

      case ProductTypeEnum.DELIVERY:
      case ProductTypeEnum['E-TICKET']:
        return OrderEntity.from(tmpOrder.raw, memberId);

      default:
        throw new BadRequestException(
          `지원하지 않는 주문 타입입니다: ${tmpOrder.type}`
        );
    }
  }

  /**
   * PortOne 결제 승인 및 Payment 저장
   */
  private async confirmPayment(
    data: ShopPaymentCompleteInput,
    order: OrderEntity
  ): Promise<void> {
    const { paymentId, paymentToken, txId } = data;
    await this.generatePortoneAccessToken();

    try {
      // 1. 결제 승인
      await axios.post(
        `${this.PORTONE_API_URL}/payments/${paymentId}/confirm`,
        { paymentToken, txId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.portoneToken.accessToken}`,
          },
        }
      );

      this.logger.log('Payment confirmed successfully');

      // 2. 결제 상세 정보 조회 (결제 수단 등 상세 정보 포함)
      const paymentDetail = await this.getPaymentDetail(paymentId);

      // Payment 저장 (실패해도 결제 승인은 이미 완료된 상태)
      await this.savePaymentSafely(order, paymentDetail, txId);
    } catch (error: any) {
      if (error.response?.data?.type === 'ALREADY_PAID') {
        this.logger.log('이미 결제된 요청은 에러 없이 처리');

        // 기존 Payment 존재 여부 확인
        const existingPayment =
          await this.repositoryProvider.PaymentRepository.findOne({
            where: { impUid: txId },
          });

        if (existingPayment) {
          this.logger.log(`이미 저장된 Payment 존재. impUid=${txId}`);
          return;
        }

        // 결제 상세 정보 조회 후 저장
        const paymentDetail = await this.getPaymentDetail(paymentId);
        await this.savePaymentSafely(order, paymentDetail, txId);
        return;
      }
      this.logger.error('Payment confirmation failed', error);
      throw error;
    }
  }

  /**
   * PortOne 결제 상세 정보 조회
   */
  private async getPaymentDetail(
    paymentId: string
  ): Promise<Record<string, any>> {
    try {
      const response = await axios.get(
        `${this.PORTONE_API_URL}/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.portoneToken.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get payment detail', error);
      return {};
    }
  }

  /**
   * Payment 엔티티 저장
   */
  private async savePayment(
    order: OrderEntity,
    pgRawData: Record<string, any>,
    txId: string
  ): Promise<void> {
    const payment = new PaymentEntity();
    payment.orderId = order.id;
    payment.paidAt = new Date();
    payment.pgProvider = 'portone';
    payment.pgRawData = pgRawData;
    payment.paidAmount = order.totalAmount;
    payment.nowAmount = order.totalAmount;
    payment.impUid = txId;

    await this.repositoryProvider.PaymentRepository.save(payment);
    this.logger.log(`Payment saved: ${payment.id}`);
  }

  /**
   * Payment 저장 (실패 시 로깅만 하고 에러를 던지지 않음)
   * - 결제 승인 이후이므로 실패해도 전체 트랜잭션을 롤백하면 안 됨
   * - 대신 로그를 남겨서 수동 복구 가능하도록 함
   */
  private async savePaymentSafely(
    order: OrderEntity,
    pgRawData: Record<string, any>,
    txId: string
  ): Promise<void> {
    try {
      await this.savePayment(order, pgRawData, txId);
    } catch (error) {
      this.logger.error(
        `[CRITICAL] Payment 저장 실패 - 수동 복구 필요. orderId=${order.id}, txId=${txId}`,
        error
      );
    }
  }

  async generatePortoneAccessToken() {
    // 토큰이 유효하면 재발급하지 않음
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
      // 실제 expired 는 30분이지만 안정성을 위해 20분으로 처리
      expiredAt: dayjs().add(20, 'minutes'),
    };
    this.logger.log('PortOne access token generated');
  }
}
