import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  EntityManager,
} from 'typeorm';
import {
  BaseSettlementEntity,
  SettlementStatusEnumType,
} from './settlement.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

/**
 * BrandSettlementEntity - 브랜드 정산 엔티티
 *
 * 브랜드에게 지급할 공급가(supplyPrice) 정산 정보를 관리합니다.
 */
@Entity('brand_settlement')
@Index('IDX_brand_settlement_brand_id', ['brandId'])
@Index('IDX_brand_settlement_status', ['status'])
@Index('IDX_brand_settlement_period', ['periodYear', 'periodMonth'])
export class BrandSettlementEntity extends BaseSettlementEntity {
  /** 브랜드 ID */
  @Column({ name: 'brand_id' })
  brandId: number;

  /** 브랜드 관계 */
  @ManyToOne(() => BrandEntity)
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  /** 연결된 주문 목록 */
  @OneToMany('OrderEntity', 'brandSettlement')
  orders: OrderEntity[];
}

export const getBrandSettlementRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(BrandSettlementEntity)
    .extend({
      /**
       * 특정 브랜드의 특정 기간 정산 조회
       */
      async findByBrandAndPeriod(
        brandId: number,
        periodYear: number,
        periodMonth: number
      ): Promise<BrandSettlementEntity | null> {
        return this.findOne({
          where: { brandId, periodYear, periodMonth },
        });
      },

      /**
       * 상태별 정산 목록 조회
       */
      async findByStatus(
        status: SettlementStatusEnumType
      ): Promise<BrandSettlementEntity[]> {
        return this.find({
          where: { status },
          relations: ['brand'],
          order: { scheduledAt: 'ASC' },
        });
      },
    });
