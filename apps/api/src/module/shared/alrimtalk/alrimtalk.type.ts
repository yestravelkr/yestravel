/**
 * 알림톡/SMS 발송 관련 타입 정의
 */

export enum SmsMessageType {
  SMS = '4',
  LMS = '6',
}

export interface SendSmsResult {
  resultCode: number;
  cmid: string;
  success: boolean;
}

export interface SmtntResponse {
  result_code: number;
  cmid: string;
}

export interface PurchaseOrderTalkProps {
  productName: string;
  orderNumber: string;
  price: number;
  userName?: string;
  orderSecret: string;
}

export interface VbankOrderTalkProps {
  productName: string;
  orderNumber: string;
  price: number;
  orderSecret: string;
  vbankName: string;
  vbankAccountNumber: string;
  dueDate: Date;
}
