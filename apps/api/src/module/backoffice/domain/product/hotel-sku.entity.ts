import {
  Entity,
  Column,
  EntityManager,
  Index,
} from 'typeorm';
import { SkuEntity } from './sku.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { HotelSku } from '@yestravelkr/option-selector';

/**
 * Hotel SKU Entity
 * 
 * SkuEntity를 상속받아 호텔 전용 SKU 생성
 * 일반 SKU와 달리 attributes 대신 특정 날짜(체크인 날짜)의 재고만 관리
 * HotelSku 인터페이스와 구조를 일치시켜 변환 없이 사용 가능합니다.
 */
@Entity('hotel_sku')
@Index('IDX_hotel_sku_template_date', ['productTemplateId', 'checkInDate'], {
  unique: true,
})
@Index('IDX_hotel_sku_date', ['checkInDate'])
export class HotelSkuEntity extends SkuEntity implements HotelSku {
  /**
   * 체크인 날짜 (YYYY-MM-DD)
   * 해당 날짜에 체크인할 때 사용 가능한 방의 재고를 관리
   * 
   * HotelSku 인터페이스의 date와 매핑됨
   */
  @Column({ name: 'check_in_date', type: 'date' })
  date: string;
}

export const getHotelSkuRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelSkuEntity);
