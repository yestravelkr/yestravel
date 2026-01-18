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
    data: ShopPaymentCompleteInput
  ): Promise<ShopPaymentCompleteOutput> {
    this.logger.log('Payment complete webhook received');
    this.logger.log(JSON.stringify(data, null, 2));

    const { paymentId } = data;

    // 1. TmpOrder 조회 (paymentId = orderNumber)
    const tmpOrder = await this.getTmpOrderByOrderNumber(paymentId);

    // 2. TmpOrder → Order 변환 (타입별로 적절한 엔티티 사용)
    const order = this.createOrderFromTmpOrder(tmpOrder);

    // 3. Order 상태를 PAID로 업데이트 및 저장
    order.status = OrderStatusEnum.PAID;
    await this.saveOrder(order);

    // 4. TmpOrder 삭제 (임시 데이터이므로 hard delete)
    await this.repositoryProvider.TmpOrderRepository.delete({id: tmpOrder.id});

    this.logger.log(`Order created successfully: ${order.id}`);

    // 마지막. 내부로직 문제 없을 시 PortOne 결제 수동 승인
    await this.confirmPayment(data);

    return {
      success: true,
      message: 'Payment completed and order created',
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
   * Order 저장
   */
  private async saveOrder(order: OrderEntity): Promise<void> {
    await this.repositoryProvider.OrderRepository.save(order);
  }

  /**
   * TmpOrder → Order 변환 (타입별로 적절한 엔티티 사용)
   */
  private createOrderFromTmpOrder(
    tmpOrder: Awaited<ReturnType<typeof this.getTmpOrderByOrderNumber>>
  ): OrderEntity {
    switch (tmpOrder.type) {
      case ProductTypeEnum.HOTEL:
        return HotelOrderEntity.fromHotel(tmpOrder.raw);

      case ProductTypeEnum.DELIVERY:
      case ProductTypeEnum['E-TICKET']:
        return OrderEntity.from(tmpOrder.raw);

      default:
        throw new BadRequestException(
          `지원하지 않는 주문 타입입니다: ${tmpOrder.type}`
        );
    }
  }

  // Portone 결제 승인
  async confirmPayment(data: ShopPaymentCompleteInput): Promise<void> {
    const { paymentId, paymentToken, txId } = data;
    await this.generatePortoneAccessToken();
    await axios
      .post(
        `${this.PORTONE_API_URL}/payments/${paymentId}/confirm`,
        {
          paymentToken,
          txId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.portoneToken.accessToken}`,
          },
        }
      )
      .then(response => {
        this.logger.log('Payment confirmed successfully');
      })
      .catch(error => {
        if (error.response?.data.type === 'ALREADY_PAID') {
          this.logger.log('이미 결제된 요청은 에러 없이 처리');
          return;
        }
        this.logger.error('Payment confirmation failed', error);
        throw error;
      });
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
