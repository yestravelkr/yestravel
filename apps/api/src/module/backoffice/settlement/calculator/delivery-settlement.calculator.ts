import { Injectable } from '@nestjs/common';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import {
  SettlementCalculator,
  SettlementCalculationResult,
} from './settlement-calculator.interface';

/**
 * DeliverySettlementCalculator - 배송 상품 정산 계산기
 *
 * 배송 주문의 정산 금액을 계산합니다.
 * TODO: 배송 상품에 공급가/수수료 필드 추가 필요
 */
@Injectable()
export class DeliverySettlementCalculator implements SettlementCalculator {
  getSupportedType() {
    return ProductTypeEnum.DELIVERY;
  }

  calculate(order: OrderEntity): SettlementCalculationResult {
    // TODO: 배송 스냅샷 구조에 맞게 구현
    const totalSales = order.totalAmount;

    return {
      totalSales,
      totalQuantity: 1,
      influencerAmount: 0, // TODO: 배송 commission 구현
      brandAmount: 0, // TODO: 배송 supplyPrice 구현
    };
  }
}
