/**
 * Format Utils - 공통 포맷팅 유틸리티
 *
 * 날짜, 가격 등의 포맷팅 함수를 제공합니다.
 *
 * Usage:
 * import { formatShortDate, formatPrice } from '@/shared';
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

/**
 * 2자리 년도 날짜 포맷 (25.01.01)
 */
export function formatShortDate(date: Date | string): string {
  return dayjs(date).format('YY.MM.DD');
}

/**
 * 요일 포함 날짜 포맷 (25.01.01(금))
 */
export function formatDateWithDay(date: Date | string): string {
  return dayjs(date).format('YY.MM.DD(dd)');
}

/**
 * 가격 포맷 (26,890원~)
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원~`;
}

/**
 * 가격 포맷 (물결 없음) (26,890원)
 */
export function formatPriceExact(price: number): string {
  return `${price.toLocaleString()}원`;
}
