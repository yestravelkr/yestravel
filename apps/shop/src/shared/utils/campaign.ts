/**
 * Campaign Utils - 캠페인 관련 유틸리티
 *
 * 캠페인 상태 계산, 할인율 계산 등의 함수를 제공합니다.
 *
 * Usage:
 * import { getCampaignStatus, calculateDiscountRate } from '@/shared';
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

export type CampaignStatusType = 'upcoming' | 'ongoing';

export interface CampaignStatus {
  type: CampaignStatusType;
  label: string;
}

/**
 * 캠페인 상태 계산
 * - upcoming: 오픈 예정
 * - ongoing: 진행 중 (N일 후 종료)
 */
export function getCampaignStatus(
  startAt: Date | string,
  endAt: Date | string
): CampaignStatus {
  const now = dayjs();
  const start = dayjs(startAt);
  const end = dayjs(endAt);

  if (now.isBefore(start)) {
    return { type: 'upcoming', label: '오픈 예정' };
  }

  const daysUntilEnd = end.diff(now, 'day') + 1;
  return { type: 'ongoing', label: `${daysUntilEnd}일 후 종료` };
}

/**
 * 할인율 계산
 * @returns 할인율 (정수, 0이면 할인 없음)
 */
export function calculateDiscountRate(
  originalPrice: number,
  price: number
): number {
  if (originalPrice <= 0 || price >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * 상품 오픈 예정 여부 체크
 */
export function isProductUpcoming(
  saleStartAt: Date | string | null | undefined,
  campaignStartAt: Date | string
): boolean {
  const now = dayjs();
  const startDate = dayjs(saleStartAt ?? campaignStartAt);
  return now.isBefore(startDate);
}
