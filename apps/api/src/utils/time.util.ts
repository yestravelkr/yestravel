/**
 * Time Utility Functions
 *
 * 시간 관련 유틸리티 함수 모음
 */

/**
 * HH:MM:SS 또는 HH:MM 형식의 시간 문자열을 HH:MM 형식으로 정규화
 *
 * @param time - 시간 문자열 (HH:MM 또는 HH:MM:SS 형식)
 * @returns HH:MM 형식으로 정규화된 시간 문자열
 *
 * @example
 * normalizeTime('14:30:00') // '14:30'
 * normalizeTime('14:30') // '14:30'
 * normalizeTime('09:15:30') // '09:15'
 */
export function normalizeTime(time: string): string {
  // HH:MM:SS 형식인 경우 HH:MM만 추출
  if (time.length > 5) {
    return time.substring(0, 5);
  }
  return time;
}

/**
 * HH:MM 또는 HH:MM:SS 형식의 정규식
 * 00:00 ~ 23:59 범위의 시간을 검증
 */
export const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

/**
 * 시간 형식 검증 에러 메시지 (한국어)
 */
export const TIME_FORMAT_ERROR_MESSAGE_KO =
  '시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다';

/**
 * 시간 형식 검증 에러 메시지 (영어)
 */
export const TIME_FORMAT_ERROR_MESSAGE_EN =
  'Time must be in HH:MM or HH:MM:SS format';
