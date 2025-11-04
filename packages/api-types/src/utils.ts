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
