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
  SettlementStatusType,
} from './settlement.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

/**
 * InfluencerSettlementEntity - 인플루언서 정산 엔티티
 *
 * 인플루언서에게 지급할 수수료(commission) 정산 정보를 관리합니다.
 */
@Entity('influencer_settlement')
@Index('IDX_influencer_settlement_influencer_id', ['influencerId'])
@Index('IDX_influencer_settlement_status', ['status'])
@Index('IDX_influencer_settlement_period', ['periodYear', 'periodMonth'])
export class InfluencerSettlementEntity extends BaseSettlementEntity {
  /** 인플루언서 ID */
  @Column({ name: 'influencer_id' })
  influencerId: number;

  /** 인플루언서 관계 */
  @ManyToOne(() => InfluencerEntity)
  @JoinColumn({ name: 'influencer_id' })
  influencer: InfluencerEntity;

  /** 연결된 주문 목록 */
  @OneToMany('OrderEntity', 'influencerSettlement')
  orders: OrderEntity[];
}

export const getInfluencerSettlementRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(InfluencerSettlementEntity)
    .extend({
      /**
       * 특정 인플루언서의 특정 기간 정산 조회
       */
      async findByInfluencerAndPeriod(
        influencerId: number,
        periodYear: number,
        periodMonth: number
      ): Promise<InfluencerSettlementEntity | null> {
        return this.findOne({
          where: { influencerId, periodYear, periodMonth },
        });
      },

      /**
       * 상태별 정산 목록 조회
       */
      async findByStatus(
        status: SettlementStatusType
      ): Promise<InfluencerSettlementEntity[]> {
        return this.find({
          where: { status },
          relations: ['influencer'],
          order: { scheduledAt: 'ASC' },
        });
      },
    });
