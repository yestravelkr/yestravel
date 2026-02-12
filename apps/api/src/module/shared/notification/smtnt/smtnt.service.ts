import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { ConfigProvider } from '@src/config';
import type { SmtntAlimtalkRequest, SmtntResponse } from './smtnt.type';

/**
 * SmtntService - SMTNT 알림톡 발송 서비스
 *
 * SMTNT API를 통해 카카오 알림톡을 발송합니다.
 * API URL: https://api2.msgagent.com/api/webshot/send/kakao/AT/{id}
 */
@Injectable()
export class SmtntService {
  private readonly logger = new Logger(SmtntService.name);
  private readonly baseUrl =
    'https://api2.msgagent.com/api/webshot/send/kakao/AT';

  /**
   * 알림톡 발송
   * @param request 알림톡 발송 요청
   * @returns SMTNT API 응답
   */
  async sendAlimtalk(request: SmtntAlimtalkRequest): Promise<SmtntResponse> {
    const config = ConfigProvider.smtnt;

    if (!config) {
      this.logger.warn('SMTNT 설정이 없습니다. 알림톡이 발송되지 않습니다.');
      return { result_code: 'SKIP', cmid: undefined };
    }

    const formData = new FormData();
    formData.append('PHONE', request.phone);
    formData.append('MSG', request.message);
    formData.append('SENDER_KEY', config.senderKey);
    formData.append('TEMPLATE_CODE', request.templateCode);
    formData.append('FAILED_TYPE', request.failedType ?? 'N');
    formData.append('CALLBACK', request.callback ?? config.callback);

    if (request.failedMessage) {
      formData.append('FAILED_MSG', request.failedMessage);
    }

    const url = `${this.baseUrl}/${config.userId}`;

    try {
      const response = await axios.post<SmtntResponse>(url, formData, {
        headers: formData.getHeaders(),
        timeout: 10000,
      });

      const { result_code, cmid } = response.data;

      // result_code 0이 성공
      if (result_code === '0') {
        this.logger.log(
          `알림톡 발송 성공: phone=${request.phone}, cmid=${cmid}`
        );
      } else {
        const errorMessage = this.getErrorMessage(result_code);
        this.logger.error(
          `알림톡 발송 실패: phone=${request.phone}, result_code=${result_code}, error=${errorMessage}`
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `알림톡 발송 실패: phone=${request.phone}`,
        error instanceof Error ? error.message : error
      );
      throw error;
    }
  }

  /**
   * SMTNT result_code에 대한 에러 메시지 반환
   */
  private getErrorMessage(resultCode: string): string {
    const errorMessages: Record<string, string> = {
      '0': '성공',
      '100': '허용되지 않은 형식',
      '101': '허용되지 않은 IP',
      '102': '허용되지 않은 파일 형식',
      '103': '허용되지 않은 사용자 아이디',
      '200': '필수 요청 값 누락',
      '300': '잘못된 요청 값',
      '301': '잘못된 요청 값(메시지 타입)',
      '302': '잘못된 요청 값(광고성 메시지 표시)',
      '304': '잘못된 요청 값(전송시간)',
      '305': '잘못된 요청 값(휴대전화번호)',
      '306': '잘못된 요청 값(데이터 없음)',
      '400': '데이터 길이 제한 초과',
      '401': '데이터 길이 제한 초과(제목)',
      '402': '데이터 길이 제한 초과(내용)',
      '403': '데이터 길이 제한 초과(대체메시지)',
      '600': 'JSON 파싱 오류',
      '999': '시스템 오류',
    };
    return errorMessages[resultCode] ?? `알 수 없는 오류 (${resultCode})`;
  }
}
