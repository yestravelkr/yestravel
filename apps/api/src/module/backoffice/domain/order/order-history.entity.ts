/**
 * OrderHistoryEntity - 주문 이력 엔티티
 *
 * 주문 상태 변경, 클레임 처리, 환불 등 주문에 발생하는
 * 모든 이벤트를 시간순으로 기록합니다.
 */

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  EntityManager,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { OrderStatusEnumType } from './order-status';
import type { OrderHistoryAction } from './order-history-action';
import type { OrderHistoryMetadata } from './order-history-metadata.type';

@Entity('order_history')
@Index('IDX_order_history_order_id', ['orderId'])
@Index('IDX_order_history_action', ['action'])
export class OrderHistoryEntity extends BaseEntity {
  // ===== 주문 관계 =====

  /** 주문 ID */
  @Column({ name: 'order_id' })
  orderId: number;

  /** 주문 관계 */
  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // ===== 상태 정보 =====

  /** 이전 상태 (최초 생성 시 null) */
  @Column({
    name: 'previous_status',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  previousStatus: OrderStatusEnumType | null;

  /** 변경된 상태 */
  @Column({ name: 'new_status', type: 'varchar', length: 30 })
  newStatus: OrderStatusEnumType;

  // ===== 액터 정보 =====

  /** 액터 타입: SYSTEM | USER | ADMIN */
  @Column({ name: 'actor_type', type: 'varchar', length: 10 })
  actorType: 'SYSTEM' | 'USER' | 'ADMIN';

  /** 액터 ID (SYSTEM일 때 null) */
  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId: number | null;

  /** 액터 이름 */
  @Column({ name: 'actor_name', type: 'varchar', length: 50, nullable: true })
  actorName: string | null;

  // ===== 액션 정보 =====

  /** 액션 타입 */
  @Column({ type: 'varchar', length: 30 })
  action: OrderHistoryAction;

  /** 설명 (UI 표시용, 한국어) */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  // ===== 관련 정보 =====

  /** 클레임 ID (클레임 관련 액션일 때) */
  @Column({ name: 'claim_id', type: 'int', nullable: true })
  claimId: number | null;

  /** 옵션 ID (특정 옵션 관련 액션일 때) */
  @Column({ name: 'option_id', type: 'int', nullable: true })
  optionId: number | null;

  /** 옵션 이름 */
  @Column({ name: 'option_name', type: 'varchar', length: 100, nullable: true })
  optionName: string | null;

  /** 부가 메타데이터 (JSONB) */
  @Column({ type: 'jsonb', nullable: true })
  metadata: OrderHistoryMetadata | null;
}

export const getOrderHistoryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(OrderHistoryEntity);
