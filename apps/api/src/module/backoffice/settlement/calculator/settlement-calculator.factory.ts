import { Injectable } from '@nestjs/common';
import { ProductTypeEnumType } from '@src/module/backoffice/admin/admin.schema';
import { SettlementCalculator } from './settlement-calculator.interface';
import { HotelSettlementCalculator } from './hotel-settlement.calculator';
import { ETicketSettlementCalculator } from './eticket-settlement.calculator';
import { DeliverySettlementCalculator } from './delivery-settlement.calculator';

/**
 * SettlementCalculatorFactory - 정산 계산기 팩토리
 *
 * 상품 유형에 맞는 정산 계산기를 반환합니다.
 */
@Injectable()
export class SettlementCalculatorFactory {
  private calculators: Map<ProductTypeEnumType, SettlementCalculator>;

  constructor(
    private hotelCalculator: HotelSettlementCalculator,
    private eticketCalculator: ETicketSettlementCalculator,
    private deliveryCalculator: DeliverySettlementCalculator
  ) {
    this.calculators = new Map([
      [this.hotelCalculator.getSupportedType(), this.hotelCalculator],
      [this.eticketCalculator.getSupportedType(), this.eticketCalculator],
      [this.deliveryCalculator.getSupportedType(), this.deliveryCalculator],
    ]);
  }

  /**
   * 상품 유형에 맞는 계산기 반환
   * @param type 상품 유형
   * @throws Error 지원하지 않는 상품 유형인 경우
   */
  getCalculator(type: ProductTypeEnumType): SettlementCalculator {
    const calculator = this.calculators.get(type);
    if (!calculator) {
      throw new Error(`Unsupported product type for settlement: ${type}`);
    }
    return calculator;
  }
}
