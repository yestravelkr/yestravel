import {
  Entity,
  Column,
  EntityManager,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import type { AdditionalPaymentEntity } from '@src/module/backoffice/domain/order/additional-payment.entity';

/**
 * PaymentEntity - 결제 엔티티
 *
 * PG사를 통한 결제 정보를 저장합니다.
 */
@Entity('payment')
@Index('IDX_payment_imp_uid', ['impUid'], { unique: true })
@Index('IDX_payment_paid_at', ['paidAt'])
export class PaymentEntity extends BaseEntity {
  /** 결제 완료 일시 */
  @Column({ name: 'paid_at', type: 'timestamp with time zone', nullable: true })
  paidAt: Nullish<Date>;

  /** PG사 (portone, toss 등) */
  @Column({ name: 'pg_provider', type: 'varchar', length: 50 })
  pgProvider: string;

  /** PG 원본 응답 데이터 */
  @Column({ name: 'pg_raw_data', type: 'jsonb', nullable: true })
  pgRawData: Nullish<Record<string, any>>;

  /** 결제 금액 (최초 결제 금액) */
  @Column({ name: 'paid_amount', type: 'integer' })
  paidAmount: number;

  /** 현재 금액 (환불 등 이후 남은 금액) */
  @Column({ name: 'now_amount', type: 'integer' })
  nowAmount: number;

  /** 포트원 결제 고유 ID */
  @Column({ name: 'imp_uid', type: 'varchar', length: 100 })
  impUid: string;

  @Column()
  orderId: number;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @OneToOne(
    () => require('./additional-payment.entity').AdditionalPaymentEntity,
    (ap: AdditionalPaymentEntity) => ap.payment
  )
  additionalPayment?: AdditionalPaymentEntity;
}

export const getPaymentRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(PaymentEntity);
