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

  /**
   * 날짜별 공급가 및 수수료 (JSONB)
   * Record<string, { supplyPrice: number; commission: number }> 형태로 저장
   *
   * 예시:
   * {
   *   "2025-01-15": { "supplyPrice": 25000, "commission": 5000 },
   *   "2025-01-16": { "supplyPrice": 28000, "commission": 7000 }
   * }
   *
   * 날짜 형식: YYYY-MM-DD (체크인 날짜 기준)
   */
  @Column('jsonb', { name: 'another_price_by_date', default: {} })
  anotherPriceByDate: Record<
    string,
    { supplyPrice: number; commission: number }
  >;
}

/**
 * HotelOption Input 인터페이스
 * Service에서 옵션 저장/업데이트 시 사용
 */
export interface HotelOptionInput {
  id?: number | null;
  name: string;
  priceByDate: Record<string, number>;
  anotherPriceByDate: Record<
    string,
    { supplyPrice: number; commission: number }
  >;
}

export const getHotelOptionRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(HotelOptionEntity)
    .extend({
      /**
       * 호텔 옵션 배치 저장 (생성 시 사용)
       */
      async saveOptions(
        productId: number,
        options: HotelOptionInput[]
      ): Promise<void> {
        const optionEntities = options.map(option => {
          const entity = new HotelOptionEntity();
          entity.productId = productId;
          entity.name = option.name;
          entity.priceByDate = option.priceByDate;
          entity.anotherPriceByDate = option.anotherPriceByDate;
          return entity;
        });

        await this.save(optionEntities);
      },

      /**
       * 호텔 옵션 업데이트 (PUT 방식: 기존 옵션 soft delete 후 새로 저장)
       */
      async updateOptions(
        productId: number,
        options: HotelOptionInput[]
      ): Promise<void> {
        // 1. 기존 옵션 조회
        const existingOptions: HotelOptionEntity[] = await this.find({
          where: { productId },
        });

        // 2. 입력에 없는 기존 옵션들 soft delete
        const inputOptionIds = options
          .filter(opt => opt.id)
          .map(opt => opt.id as number);

        const optionsToDelete = existingOptions.filter(
          (existing: HotelOptionEntity) => !inputOptionIds.includes(existing.id)
        );

        if (optionsToDelete.length > 0) {
          await this.softDelete(
            optionsToDelete.map((opt: HotelOptionEntity) => opt.id)
          );
        }

        // 3. 옵션 저장 (배치 처리)
        const optionsToSave: HotelOptionEntity[] = [];

        for (const option of options) {
          if (option.id) {
            // 기존 옵션 업데이트
            const existingOption = existingOptions.find(
              (existing: HotelOptionEntity) => existing.id === option.id
            );
            if (existingOption) {
              existingOption.name = option.name;
              existingOption.priceByDate = option.priceByDate;
              existingOption.anotherPriceByDate = option.anotherPriceByDate;
              optionsToSave.push(existingOption);
            }
          } else {
            // 새 옵션 생성
            const newOption = new HotelOptionEntity();
            newOption.productId = productId;
            newOption.name = option.name;
            newOption.priceByDate = option.priceByDate;
            newOption.anotherPriceByDate = option.anotherPriceByDate;
            optionsToSave.push(newOption);
          }
        }

        if (optionsToSave.length > 0) {
          await this.save(optionsToSave);
        }
      },
    });
