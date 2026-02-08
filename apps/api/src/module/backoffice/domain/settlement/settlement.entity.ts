import { Column, ValueTransformer } from 'typeorm';
import dayjs from 'dayjs';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

/**
 * SettlementStatusEnumType - 정산 상태 타입
 */
export type SettlementStatusEnumType = 'PENDING' | 'COMPLETED';

export const SETTLEMENT_STATUS_ENUM_VALUE = ['PENDING', 'COMPLETED'] as const;

export const SettlementStatusEnum = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
};

/**
 * DateTransformer - date 타입 컬럼의 string → Date 변환
 */
const dateTransformer: ValueTransformer = {
  to: (value: Date | string | null): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : dayjs(value).toDate();
  },
  from: (value: string | Date | null): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : dayjs(value).toDate();
  },
};

/**
 * BaseSettlementEntity - 정산 베이스 엔티티 (추상)
 *
 * 인플루언서/브랜드 정산의 공통 필드를 정의합니다.
 * 이 클래스는 DB 테이블을 생성하지 않습니다.
 */
export abstract class BaseSettlementEntity extends BaseEntity {
  /** 정산 연도 */
  @Column({ name: 'period_year' })
  periodYear: number;

  /** 정산 월 (1~12) */
  @Column({ name: 'period_month' })
  periodMonth: number;

  /** 정산 상태 (PENDING / COMPLETED) */
  @Column({ default: SettlementStatusEnum.PENDING })
  status: SettlementStatusEnumType;

  /** 정산 예정일 */
  @Column({ name: 'scheduled_at', type: 'date', transformer: dateTransformer })
  scheduledAt: Date;

  /** 정산 완료일 */
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  /** 총 매출 (캐시) */
  @Column({ name: 'total_sales', default: 0 })
  totalSales: number;

  /** 총 수량 (캐시) */
  @Column({ name: 'total_quantity', default: 0 })
  totalQuantity: number;

  /** 총 정산금액 (캐시) */
  @Column({ name: 'total_amount', default: 0 })
  totalAmount: number;
}
