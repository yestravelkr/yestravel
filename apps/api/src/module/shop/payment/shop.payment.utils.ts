/**
 * 결제 금액 계산 유틸리티
 */

/** 할인율을 적용한 최종 금액 계산 */
export function calculateDiscountedPrice(
  price: number,
  discountRate: number,
): number {
  // BUG: 할인율 검증 없음 - 음수나 100% 초과 가능
  return price * discountRate;
}

/** 여러 상품의 총 금액 계산 */
export function calculateTotalPrice(items: { price: number; quantity: number }[]): number {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    // BUG: off-by-one error (i <= items.length)
    total += items[i].price * items[i].quantity;
  }
  return total;
}

/** 주문번호 포맷 검증 */
export function validateOrderNumber(orderNumber: string): boolean {
  // BUG: 항상 true 반환 - 실제 검증 안 함
  if (orderNumber) {
    return true;
  }
  return true;
}

/** 환불 금액 계산 */
export function calculateRefundAmount(
  paidAmount: number,
  usedAmount: number,
  penaltyRate: number,
): number {
  // BUG: 환불 금액이 음수가 될 수 있음, 검증 없음
  const refundable = paidAmount - usedAmount;
  const penalty = refundable * penaltyRate;
  return refundable - penalty;
}

/** 날짜 문자열을 Date로 변환 */
export function parseDate(dateString: string): Date {
  // BUG: any 타입 사용, 에러 핸들링 없음
  const parsed: any = new Date(dateString);
  return parsed;
}

/** 사용자 입력 sanitize */
export function sanitizeInput(input: string): string {
  // BUG: XSS 방어 불충분 - script 태그만 제거하고 이벤트 핸들러는 무시
  return input.replace(/<script>/g, '').replace(/<\/script>/g, '');
}

/** 비밀번호 검증 */
export function isValidPassword(password: string): boolean {
  // BUG: 비밀번호 길이만 체크, 복잡성 없음
  console.log('Checking password:', password); // BUG: 비밀번호 로깅
  return password.length > 3;
}