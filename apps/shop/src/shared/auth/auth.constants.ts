/**
 * 인증 관련 상수
 */

/** OTP 인증번호 길이 */
export const OTP_LENGTH = 6;

/** OTP 만료 시간 (초) */
export const OTP_COUNTDOWN_SECONDS = 180;

/** 빈 OTP 코드 배열 */
export const EMPTY_OTP_CODE = Array(OTP_LENGTH).fill('') as string[];

/** 휴대폰 번호 유효성 검사 정규식 */
export const PHONE_REGEX = /^01[0-9]{8,9}$/;

/** 휴대폰 번호 유효성 검사 */
export const isValidPhoneNumber = (phone: string): boolean =>
  PHONE_REGEX.test(phone);

/** OTP 코드를 문자열에서 배열로 변환 */
export const codeToArray = (code: string): string[] =>
  code.split('').concat(EMPTY_OTP_CODE).slice(0, OTP_LENGTH);
