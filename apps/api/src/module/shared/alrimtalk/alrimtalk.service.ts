import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import dayjs from 'dayjs';
import { ConfigProvider } from '@src/config';
import { AlrimtalkTemplate, AlrimtalkTemplateType } from './alrimtalk.template';
import { replaceString } from './alrimtalk.util';
import {
  SendSmsResult,
  SmsMessageType,
  PurchaseOrderTalkProps,
  VbankOrderTalkProps,
} from './alrimtalk.type';

/**
 * AlrimtalkService - SMTNT API를 통한 알림톡/SMS 발송 서비스
 * 알림톡 우선 발송, 실패 시 SMS 대체 발송 지원
 */
@Injectable()
export class AlrimtalkService {
  private readonly logger = new Logger(AlrimtalkService.name);

  private get config() {
    if (!ConfigProvider.alrimtalk) {
      throw new Error('Alrimtalk configuration is not defined');
    }
    return ConfigProvider.alrimtalk;
  }

  /**
   * 카카오 알림톡 발송
   * SENDER_KEY가 설정되어 있을 때만 동작
   */
  async sendTalk(
    templateType: AlrimtalkTemplateType,
    phone: string,
    replaces: Record<string, string>
  ): Promise<SendSmsResult> {
    const targetTemplate = AlrimtalkTemplate[templateType];
    const message = replaceString(targetTemplate.message, replaces);

    // SENDER_KEY가 없으면 SMS로 대체
    if (!this.config.kakao?.senderKey) {
      this.logger.warn('SENDER_KEY not configured, falling back to SMS');
      return this.sendSms(templateType, phone, replaces);
    }

    const formData = new FormData();
    formData.append('PHONE', phone);
    formData.append('MSG', message);
    formData.append('SENDER_KEY', this.config.kakao.senderKey);
    formData.append('TEMPLATE_CODE', targetTemplate.code);
    formData.append('FAILED_TYPE', 'S'); // 실패 시 SMS로 대체 발송

    if (targetTemplate.buttonJson?.length) {
      const buttonTypes = targetTemplate.buttonJson
        .map((button) => button.type)
        .join(',');
      const buttonNames = targetTemplate.buttonJson
        .map((button) => button.name)
        .join(',');
      const buttonUrls = targetTemplate.buttonJson
        .map((button) => `${this.config.shopUrl}${button.url}`)
        .join(',');

      formData.append('BTN_TYPES', buttonTypes);
      formData.append('BTN_TXTS', buttonNames);
      formData.append('BTN_URLS1', replaceString(buttonUrls, replaces));
      formData.append('BTN_URLS2', replaceString(buttonUrls, replaces));
    }

    try {
      const response = await axios.post(
        `${this.config.smtnt.apiUrl}/api/webshot/send/kakao/AT/${this.config.smtnt.userId}`,
        formData.getBuffer(),
        { headers: formData.getHeaders() }
      );

      const success = response.data?.result_code === 0;
      if (!success) {
        this.logger.warn(
          `Alrimtalk failed: ${response.data?.result_code}, will fallback to SMS`
        );
      }

      return {
        resultCode: response.data?.result_code ?? -1,
        cmid: response.data?.cmid ?? '',
        success,
      };
    } catch (error) {
      this.logger.error('Alrimtalk send failed', error);
      return {
        resultCode: -1,
        cmid: '',
        success: false,
      };
    }
  }

  /**
   * SMS/LMS 발송
   * 메시지 길이에 따라 자동으로 SMS/LMS 결정
   */
  async sendSms(
    templateType: AlrimtalkTemplateType,
    phone: string,
    replaces: Record<string, string>
  ): Promise<SendSmsResult> {
    const targetTemplate = AlrimtalkTemplate[templateType];
    let message = replaceString(targetTemplate.message, replaces);

    // 버튼이 있으면 메시지 최하단에 링크 추가
    if (targetTemplate.buttonJson?.length) {
      const linkLines = targetTemplate.buttonJson
        .map((button) => {
          const fullUrl = `${this.config.shopUrl}${button.url}`;
          return `${button.name}: ${replaceString(fullUrl, replaces)}`;
        })
        .join('\n');
      message = `${message}\n\n${linkLines}`;
    }

    // 메시지 길이에 따라 SMS/LMS 자동 결정
    const msgType =
      Buffer.byteLength(message, 'utf8') > 90
        ? SmsMessageType.LMS
        : SmsMessageType.SMS;

    const formData = new FormData();
    formData.append('dest_phone', phone);
    formData.append('send_phone', this.config.smtnt.senderNumber);
    formData.append('msg_body', message);

    if (msgType === SmsMessageType.LMS) {
      formData.append('subject', targetTemplate.title);
    }

    this.logger.log(
      `Sending ${msgType === SmsMessageType.SMS ? 'SMS' : 'LMS'} to ${phone}`
    );

    try {
      const response = await axios.post(
        `${this.config.smtnt.apiUrl}/api/webshot/send/general/${msgType}/${this.config.smtnt.userId}`,
        formData.getBuffer(),
        { headers: formData.getHeaders() }
      );

      return {
        resultCode: response.data?.result_code ?? -1,
        cmid: response.data?.cmid ?? '',
        success: response.data?.result_code === 0,
      };
    } catch (error) {
      this.logger.error('SMS send failed', error);
      return {
        resultCode: -1,
        cmid: '',
        success: false,
      };
    }
  }

  /**
   * 인증번호 발송
   * 알림톡 우선, 실패 시 SMS 대체
   */
  async sendVerificationCode(
    phone: string,
    code: string
  ): Promise<SendSmsResult> {
    return this.sendTalk(AlrimtalkTemplateType.VerificationCode, phone, {
      인증번호: code,
    });
  }

  /**
   * 결제 완료 알림
   */
  async sendPurchasedOrderTalk(
    phone: string,
    props: PurchaseOrderTalkProps
  ): Promise<SendSmsResult> {
    const { productName, orderNumber, price, userName = '고객', orderSecret } = props;
    return this.sendTalk(AlrimtalkTemplateType.OrderPurchase, phone, {
      결제금액: price.toLocaleString(),
      주문번호: orderNumber,
      상품명: productName,
      고객: userName,
      주문비밀번호: orderSecret,
    });
  }

  /**
   * 가상계좌 입금 안내
   */
  async sendVbankOrderTalk(
    phone: string,
    props: VbankOrderTalkProps
  ): Promise<SendSmsResult> {
    const {
      productName,
      orderNumber,
      price,
      orderSecret,
      vbankName,
      vbankAccountNumber,
      dueDate,
    } = props;
    return this.sendTalk(AlrimtalkTemplateType.VbankRequest, phone, {
      상품명: productName,
      입금일시: dayjs(dueDate).format('YYYY년 MM월 DD일 HH시 mm분'),
      은행명: vbankName,
      계좌번호: vbankAccountNumber,
      결제금액: price.toLocaleString(),
      주문번호: orderNumber,
      주문비밀번호: orderSecret,
    });
  }
}
