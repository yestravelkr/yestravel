import {
  Entity,
  Column,
  EntityManager,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import { PaymentEntity } from '@src/module/backoffice/domain/order/payment.entity';
import type { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import Sqids from 'sqids';
import dayjs from 'dayjs';
import { ConfigProvider } from '@src/config';

/** 추가결제 유효기간 (시간) */
export const ADDITIONAL_PAYMENT_EXPIRY_HOURS = 24;

const sqids = new Sqids({
  minLength: 8,
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
});

/**
 * AdditionalPayment Number Parser
 *
 * 형식: ${ENV_PREFIX}ADDPAY${YYMMDD}-${encodedNumber}
 * - production: ADDPAY260327-ABC12345
 * - development: DADDPAY260327-ABC12345
 * - localdev: LADDPAY260327-ABC12345
 */
export const additionalPaymentNumberParser = {
  /**
   * 추가결제번호 인코딩
   * @param ids - [additionalPaymentId] 배열
   * @param date - 추가결제 생성 날짜
   */
  encode(ids: number[], date: Date): string {
    const envPrefix = ConfigProvider.envPrefix;
    const dateStr = dayjs(date).format('YYMMDD');
    const encoded = sqids.encode(ids);
    return `${envPrefix}ADDPAY${dateStr}-${encoded}`;
  },

  /**
   * 추가결제번호 디코딩
   * @param additionalPaymentNumber - 추가결제번호 문자열
   * @returns [additionalPaymentId] 배열
   */
  decode(additionalPaymentNumber: string): number[] {
    // 마지막 '-' 이후의 인코딩된 부분만 추출
    const encoded = additionalPaymentNumber.slice(
      additionalPaymentNumber.lastIndexOf('-') + 1
    );
    return sqids.decode(encoded);
  },
};

/**
 * AdditionalPaymentEntity - 추가결제 엔티티
 *
 * 주문 결제 이후 추가 금액을 결제받기 위한 엔티티입니다.
 * 관리자가 생성하고, 고객이 토큰 기반 링크로 접근하여 결제합니다.
 */
@Entity('additional_payment')
@Index('IDX_additional_payment_expires_at', ['expiresAt'])
@Index('IDX_additional_payment_order_id', ['orderId'])
export class AdditionalPaymentEntity extends SoftDeleteEntity {
  /** 주문 ID (FK) */
  @Column({ name: 'order_id' })
  orderId: number;

  /** 주문 관계 (N:1) */
  @ManyToOne('OrderEntity')
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  /** 결제 링크 토큰 (UUID v4) */
  @Column({ type: 'varchar', length: 64, unique: true })
  token: string;

  /** 결제 창에 표시할 제목 */
  @Column({ type: 'varchar', length: 200 })
  title: string;

  /** 결제 금액 (최소 1,000원) */
  @Column({ type: 'integer' })
  amount: number;

  /** 추가결제 사유 */
  @Column({ type: 'varchar', length: 500 })
  reason: string;

  /** 유효기간 만료 일시 */
  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  /** 결제 ID (결제 완료 시 설정) */
  @Column({ name: 'payment_id', nullable: true, unique: true })
  paymentId: Nullish<number>;

  /** 결제 관계 (1:1) */
  @OneToOne(() => PaymentEntity)
  @JoinColumn({ name: 'payment_id' })
  payment: Nullish<PaymentEntity>;

}

export const getAdditionalPaymentRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(AdditionalPaymentEntity);
