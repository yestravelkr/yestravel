import { Injectable } from '@nestjs/common';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import {
  SettlementCalculator,
  SettlementCalculationResult,
} from './settlement-calculator.interface';

/**
 * ETicketSettlementCalculator - E-티켓 상품 정산 계산기
 *
 * E-티켓 주문의 정산 금액을 계산합니다.
 * TODO: E-티켓 상품에 anotherPriceByDate 추가 필요
 */
@Injectable()
export class ETicketSettlementCalculator implements SettlementCalculator {
  getSupportedType() {
    return ProductTypeEnum['E-TICKET'];
  }

  calculate(order: OrderEntity): SettlementCalculationResult {
    // TODO: E-티켓 스냅샷 구조에 맞게 구현
    const totalSales = order.totalAmount;

    return {
      totalSales,
      totalQuantity: 1,
      influencerAmount: 0, // TODO: E-티켓 commission 구현
      brandAmount: 0, // TODO: E-티켓 supplyPrice 구현
    };
  }
}
