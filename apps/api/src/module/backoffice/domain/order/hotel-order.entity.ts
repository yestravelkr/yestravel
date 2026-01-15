import { Entity, Column, EntityManager } from 'typeorm';
import { OrderEntity, OrderStatusEnum } from './order.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { AddressEntity } from './address.entity';
import type { TmpOrderRawData } from './tmp-order.entity';

/**
 * HotelOrderEntity - 호텔 주문 엔티티
 *
 * OrderEntity를 상속받아 호텔 상품 주문에 필요한 추가 컬럼을 정의합니다.
 * 같은 'order' 테이블을 사용하며, type='HOTEL'인 주문을 조회합니다.
 */
@Entity('order')
export class HotelOrderEntity extends OrderEntity {
  /**
   * TmpOrderRawData에서 HotelOrderEntity 인스턴스 생성
   */
  static fromHotel(raw: TmpOrderRawData): HotelOrderEntity {
    const order = new HotelOrderEntity();

    order.type = ProductTypeEnum.HOTEL;
    order.customerName = raw.customerName;
    order.customerPhone = raw.customerPhone;
    order.productId = raw.productId;
    order.totalAmount = raw.totalAmount;
    order.influencerId = raw.influencerId;
    order.campaignId = raw.campaignId;
    order.orderOptionSnapshot = raw.orderOptionSnapshot;
    order.status = OrderStatusEnum.PENDING;

    // 호텔 전용 필드
    order.checkInDate = raw.orderOptionSnapshot.checkInDate;
    order.checkOutDate = raw.orderOptionSnapshot.checkOutDate;

    // 배송지 정보 설정 (호텔은 사용 안함)
    order.shippingAddress = new AddressEntity();
    order.shippingAddress.address = null;
    order.shippingAddress.detail = null;
    order.shippingAddress.postalCode = null;

    return order;
  }

  /** 체크인 날짜 (YYYY-MM-DD) */
  @Column({ name: 'check_in_date', type: 'date', nullable: true })
  checkInDate: Nullish<string>;

  /** 체크아웃 날짜 (YYYY-MM-DD) */
  @Column({ name: 'check_out_date', type: 'date', nullable: true })
  checkOutDate: Nullish<string>;
}

/**
 * 호텔 옵션 선택 정보 (Raw Data - 스냅샷)
 */
export interface HotelOrderOptionData {
  type: 'HOTEL';
  checkInDate: string;
  checkOutDate: string;
  /** 선택한 호텔 옵션 ID */
  hotelOptionId: number;
  /** 호텔 옵션명 (스냅샷) */
  hotelOptionName: string;
  /** 날짜별 가격 정보 (스냅샷) */
  priceByDate: Record<string, number>;
}

export const getHotelOrderRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelOrderEntity);
