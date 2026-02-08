import { Injectable } from '@nestjs/common';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import type { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import {
  SettlementCalculator,
  SettlementCalculationResult,
} from './settlement-calculator.interface';

/**
 * HotelSettlementCalculator - 호텔 상품 정산 계산기
 *
 * 호텔 주문의 정산 금액을 계산합니다.
 * - totalSales: priceByDate 합계
 * - influencerAmount: anotherPriceByDate.commission 합계
 * - brandAmount: anotherPriceByDate.supplyPrice 합계
 */
@Injectable()
export class HotelSettlementCalculator implements SettlementCalculator {
  getSupportedType() {
    return ProductTypeEnum.HOTEL;
  }

  calculate(order: OrderEntity): SettlementCalculationResult {
    const snapshot = order.orderOptionSnapshot as HotelOrderOptionData;

    const { totalSales, influencerAmount, brandAmount } = Object.entries(
      snapshot.priceByDate
    ).reduce(
      (acc, [date, price]) => {
        acc.totalSales += price;

        const another = snapshot.anotherPriceByDate?.[date];
        if (another) {
          acc.brandAmount += another.supplyPrice;
          acc.influencerAmount += another.commission;
        }

        return acc;
      },
      { totalSales: 0, influencerAmount: 0, brandAmount: 0 }
    );

    return {
      totalSales,
      totalQuantity: 1, // 호텔은 1건당 1 수량
      influencerAmount,
      brandAmount,
    };
  }
}
