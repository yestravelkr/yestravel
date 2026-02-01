import { ProductTypeEnumType } from '@src/module/backoffice/admin/admin.schema';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';

/**
 * SettlementCalculationResult - 정산 계산 결과
 */
export interface SettlementCalculationResult {
  /** 총 매출 */
  totalSales: number;
  /** 총 수량 */
  totalQuantity: number;
  /** 인플루언서 정산금액 (commission 합계) */
  influencerAmount: number;
  /** 브랜드 정산금액 (supplyPrice 합계) */
  brandAmount: number;
}

/**
 * SettlementCalculator - 정산 계산기 인터페이스
 *
 * 상품 유형별로 정산 금액을 계산하는 Strategy Pattern 인터페이스
 */
export interface SettlementCalculator {
  /**
   * 주문에 대한 정산 금액 계산
   * @param order 주문 엔티티
   * @returns 정산 계산 결과
   */
  calculate(order: OrderEntity): SettlementCalculationResult;

  /**
   * 지원하는 상품 유형 반환
   */
  getSupportedType(): ProductTypeEnumType;
}
