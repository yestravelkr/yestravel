/**
 * SMTNT 알림톡 API 타입 정의
 */

/** 대체 메시지 타입 */
export type SmtntFailedType = 'SMS' | 'LMS' | 'N';

/**
 * SMTNT 알림톡 전송 요청
 */
export interface SmtntAlimtalkRequest {
  /** 수신 휴대폰 번호 */
  phone: string;
  /** 발송 메시지 (최대 1000자) */
  message: string;
  /** 알림톡 템플릿 코드 */
  templateCode: string;
  /** 대체 메시지 타입 (SMS/LMS/N) */
  failedType?: SmtntFailedType;
  /** 대체 메시지 내용 */
  failedMessage?: string;
  /** 발신번호 (설정 기본값 사용 시 생략) */
  callback?: string;
}

/**
 * SMTNT API 응답
 */
export interface SmtntResponse {
  /** 결과 코드 */
  result_code: string;
  /** 메시지 아이디 */
  cmid?: string;
}
