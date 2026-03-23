/**
 * hotel-cancel-fee.util - 호텔 취소 수수료 계산 유틸리티
 *
 * 순수 함수로 구현하여 Shop/Backoffice 양쪽에서 공유합니다.
 */

import dayjs from 'dayjs';
import type { HotelCancelPolicyItem } from '@src/module/backoffice/domain/order/claim-detail.type';

export interface CalculateHotelCancelFeeInput {
  /** 주문 총액 */
  totalAmount: number;
  /** 체크인 날짜 (YYYY-MM-DD) */
  checkInDate: string;
  /** 호텔 상품의 취소 수수료 정책 */
  cancellationFees: HotelCancelPolicyItem[];
}

export interface CalculateHotelCancelFeeOutput {
  /** 취소 수수료 금액 */
  cancelFee: number;
  /** 적용된 수수료율 (%) */
  feePercentage: number;
  /** 체크인까지 남은 일수 */
  daysBeforeCheckIn: number;
  /** 적용된 정책 항목 */
  appliedPolicy: HotelCancelPolicyItem | undefined;
  /** 전체 정책 스냅샷 */
  cancelPolicySnapshot: HotelCancelPolicyItem[];
  /** 당일/과거 여부 (체크인 당일 또는 이후) */
  isSameDayOrPast: boolean;
}

/**
 * 호텔 취소 수수료 계산
 *
 * - dayjs로 D-day 계산 (KST 기준, 날짜 단위 diff)
 * - 정책 매칭: daysBeforeCheckIn 내림차순 정렬 후 actualDays >= policy.daysBeforeCheckIn인 첫 번째
 * - 빈 정책 배열 -> feePercentage = 0 (무료 취소)
 * - checkInDate가 없으면 에러
 * - Backoffice용: days < 0이면 0으로 클램프하여 계산
 *
 * @param input - 취소 수수료 계산 입력
 * @returns 취소 수수료 계산 결과
 * @throws Error - checkInDate가 없는 경우
 */
export function calculateHotelCancelFee(
  input: CalculateHotelCancelFeeInput
): CalculateHotelCancelFeeOutput {
  const { totalAmount, checkInDate, cancellationFees } = input;

  if (!checkInDate) {
    throw new Error('체크인 날짜 정보가 없습니다.');
  }

  // KST 기준 오늘 날짜 (시간 제외, 날짜만 비교)
  const today = dayjs().startOf('day');
  const checkIn = dayjs(checkInDate).startOf('day');
  const rawDays = checkIn.diff(today, 'day');

  // 당일/과거 여부 판단
  const isSameDayOrPast = rawDays <= 0;

  // Backoffice용: 음수 일수는 0으로 클램프
  const actualDays = Math.max(rawDays, 0);

  const cancelPolicySnapshot = [...cancellationFees];

  // 빈 정책 -> 무료 취소
  if (cancellationFees.length === 0) {
    return {
      cancelFee: 0,
      feePercentage: 0,
      daysBeforeCheckIn: actualDays,
      appliedPolicy: undefined,
      cancelPolicySnapshot,
      isSameDayOrPast,
    };
  }

  // 정책 매칭: daysBeforeCheckIn 내림차순 정렬 후 actualDays >= policy.daysBeforeCheckIn인 첫 번째
  const sortedPolicies = [...cancellationFees].sort(
    (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn
  );

  const appliedPolicy = sortedPolicies.find(
    policy => actualDays >= policy.daysBeforeCheckIn
  );

  // 매칭 없으면 가장 가까운 정책(가장 작은 daysBeforeCheckIn) 적용
  // 이는 체크인 임박 시(모든 정책 기준일보다 가까울 때) 가장 엄격한 수수료를 적용하는 것을 의미
  const effectivePolicy =
    appliedPolicy ?? sortedPolicies[sortedPolicies.length - 1];

  const feePercentage = effectivePolicy.feePercentage;
  const cancelFee = Math.round((totalAmount * feePercentage) / 100);

  return {
    cancelFee,
    feePercentage,
    daysBeforeCheckIn: actualDays,
    appliedPolicy: effectivePolicy,
    cancelPolicySnapshot,
    isSameDayOrPast,
  };
}

/**
 * 취소 수수료 미리보기 결과 매핑
 *
 * Shop/Backoffice getCancelFeePreview()에서 공통으로 사용하는 결과 매핑 함수.
 * DB 조회 결과(totalAmount)와 calculateHotelCancelFee 결과를 미리보기 응답 형태로 변환합니다.
 */
export function buildCancelFeePreviewResult(
  totalAmount: number,
  result: CalculateHotelCancelFeeOutput
) {
  return {
    cancelFee: result.cancelFee,
    feePercentage: result.feePercentage,
    daysBeforeCheckIn: result.daysBeforeCheckIn,
    totalAmount,
    refundAmount: totalAmount - result.cancelFee,
    isSameDayCancelBlocked: result.isSameDayOrPast,
    appliedPolicy: result.appliedPolicy,
    cancelPolicySnapshot: result.cancelPolicySnapshot,
  };
}
