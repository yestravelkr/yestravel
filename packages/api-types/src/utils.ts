/**
 * API Types Utilities
 *
 * server.ts에서 사용되는 유틸리티 함수들
 */

/**
 * HH:MM:SS 형식을 HH:MM으로 변환하는 함수
 *
 * @param time - HH:MM 또는 HH:MM:SS 형식의 시간 문자열
 * @returns HH:MM 형식의 시간 문자열
 *
 * @example
 * normalizeTime('14:00') // '14:00'
 * normalizeTime('14:00:00') // '14:00'
 */
export function normalizeTime(time: string): string {
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