import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigProvider } from '@src/config';
import type {
  ShopPaymentCompleteInput,
  ShopPaymentCompleteOutput,
} from './shop.payment.type';

@Injectable()
export class ShopPaymentService {
  private readonly logger = new Logger(ShopPaymentService.name);
  private readonly PORTONE_API_URL = 'https://api.portone.io';
  private readonly PORTONE_API_SECRET = ConfigProvider.portone.apiSecret;

  async handlePaymentComplete(
    data: ShopPaymentCompleteInput
  ): Promise<ShopPaymentCompleteOutput> {
    this.logger.log('Payment complete webhook received');
    this.logger.log(JSON.stringify(data, null, 2));

    // 1. Purchase 생성
    // 2. PurchaseLog 생성
    // 3. Order 상태 업데이트

    // 마지막. 내부로직 문제 없을 시 PortOne 결제 수동 승인
    await this.confirmPayment(data);

    return {
      success: true,
      message: 'Payment webhook processed',
    };
  }

  // Portone 결제 승인
  async confirmPayment(data: ShopPaymentCompleteInput): Promise<void> {
    const { paymentId, paymentToken, txId } = data;
    const apiSecret = await this.generateApiSecret();
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
            Authorization: `Bearer ${apiSecret}`,
          },
        }
      )
      .then((response) => {
        this.logger.log('Payment confirmed successfully');
      })
      .catch((error) => {
        // this.logger.error('Payment confirmation failed', error);
        console.log(error)
        // throw error;
      });
  }

  async generateApiSecret() {
    return await axios.post(`${this.PORTONE_API_URL}/login/api-secret`, {
      apiSecret: this.PORTONE_API_SECRET,
    }).then(response => {
      return response.data.accessToken
    })
  }
}
