import { Entity, Column, ManyToOne, JoinColumn, EntityManager, Index } from 'typeorm';
import { OrderEntity } from './order.entity';
import { HotelOptionEntity } from '@src/module/backoffice/domain/product/hotel-option.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import {ProductTypeEnumType} from "@src/module/backoffice/admin/admin.schema";

/**
 * HotelOrderEntity - 호텔 주문 엔티티
 *
 * OrderEntity를 상속받아 호텔 상품 주문에 필요한 추가 정보를 저장합니다.
 * PostgreSQL INHERITS를 사용하여 hotel_order 테이블이 order 테이블을 상속합니다.
 */
@Entity('hotel_order')
export class HotelOrderEntity extends OrderEntity {
  /** 체크인 날짜 (YYYY-MM-DD) */
  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: string;

  /** 체크아웃 날짜 (YYYY-MM-DD) */
  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate: string;
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

export const getHotelOrderRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source).getRepository(HotelOrderEntity);
