import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
} from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductEntity } from './product.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { HotelOption } from '@yestravelkr/option-selector';

/**
 * 호텔 옵션 Entity
 * 
 * 호텔 상품의 옵션을 정의하며, 날짜별 가격을 JSONB로 관리합니다.
 * HotelOption 인터페이스와 구조를 일치시켜 변환 없이 사용 가능합니다.
 */
@Entity('hotel_option')
@Index(['productId'])
export class HotelOptionEntity extends SoftDeleteEntity implements HotelOption {
  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * 날짜별 옵션 가격 (JSONB)
   * Record<string, number> 형태로 저장
   * 
   * 예시:
   * {
   *   "2025-01-15": 30000,
   *   "2025-01-16": 35000,
   *   "2025-01-17": 40000
   * }
   * 
   * 날짜 형식: YYYY-MM-DD (체크인 날짜 기준)
   */
  @Column('jsonb', { name: 'price_by_date', default: {} })
  priceByDate: Record<string, number>;
}

export const getHotelOptionRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelOptionEntity);
