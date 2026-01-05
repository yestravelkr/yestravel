import { Entity, Column, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  PRODUCT_TYPE_ENUM_VALUE,
  ProductTypeEnumType,
} from '@src/module/backoffice/admin/admin.schema';
import type { HotelOrderOptionData } from './hotel-order.entity';
import type { Nullish } from '@src/types/utility.type';

/**
 * TmpOrderRawData - 임시 주문 Raw 데이터
 *
 * OrderEntity로 변환할 수 있는 모든 정보를 담습니다.
 */
export interface TmpOrderRawData {
  // 고객 정보
  customerName: string;
  customerPhone: string;

  // 배송지 정보 (DELIVERY 타입용)
  shippingAddress?: Nullish<{
    address: string | null;
    detail: string | null;
    postalCode: string | null;
  }>;

  // 상품 정보
  productId: number;
  totalAmount: number;

  // 추적 정보
  influencerId: number;
  campaignId: number;

  // 상품 타입별 옵션 스냅샷
  orderOptionSnapshot: HotelOrderOptionData; // TODO: 추후 다른 타입 추가 시 Union 타입으로 확장
}

/**
 * TmpOrderEntity - 임시 주문 엔티티
 *
 * 결제 전 단계의 주문 데이터를 저장합니다.
 * type으로 상품 종류를 구분하고, raw에 OrderEntity로 변환할 데이터를 저장합니다.
 */
@Entity('tmp_order')
export class TmpOrderEntity extends BaseEntity {
  /** 상품 타입 (HOTEL, E-TICKET, DELIVERY) */
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  /** OrderEntity로 변환할 Raw 데이터 */
  @Column({ type: 'jsonb' })
  raw: TmpOrderRawData;
}

export const getTmpOrderRepository = (
  source?: TransactionService | EntityManager,
) => getEntityManager(source).getRepository(TmpOrderEntity);
