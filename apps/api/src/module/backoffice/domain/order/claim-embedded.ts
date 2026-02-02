/**
 * Claim Embedded Entities
 *
 * ClaimEntity의 관련 컬럼들을 논리적으로 그룹핑하는 Embedded 클래스들입니다.
 * 테이블은 생성되지 않고, 컬럼은 claim 테이블에 저장됩니다.
 */

import { Column } from 'typeorm';
import type { Nullish } from '@src/types/utility.type';
import type { ClaimReasonCategory } from './claim-type';

/**
 * 사유 정보 Embedded
 * 참고: TypeORM이 프로퍼티명(reason)을 prefix로 자동 추가함
 *       → reason_category, reason_detail, reason_evidence_urls
 */
export class ClaimReasonInfo {
  /** 사유 카테고리 */
  @Column({ name: 'category', type: 'varchar', length: 30 })
  category: ClaimReasonCategory;

  /** 상세 사유 */
  @Column({ name: 'detail', type: 'text', nullable: true })
  detail: Nullish<string>;

  /** 증빙자료 URL 목록 */
  @Column({ name: 'evidence_urls', type: 'jsonb', nullable: true })
  evidenceUrls: Nullish<string[]>;
}

/**
 * 금액 정보 Embedded
 * 참고: TypeORM이 프로퍼티명(amount)을 prefix로 자동 추가함
 *       → amount_original, amount_refund
 *
 * TODO: 부분 환불 지원
 * - 요청 시: refund = original - cancelFee (자동 계산)
 * - 승인 시: 관리자가 refund 금액 조정 가능 (부분 환불)
 */
export class ClaimAmountInfo {
  /** 원래 금액 (주문 금액) */
  @Column({ name: 'original', type: 'int' })
  original: number;

  /** 환불 금액 (관리자 승인 시 조정 가능) */
  @Column({ name: 'refund', type: 'int' })
  refund: number;
}
