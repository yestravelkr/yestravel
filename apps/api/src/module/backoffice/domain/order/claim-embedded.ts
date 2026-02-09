/**
 * Claim Embedded Entities
 *
 * ClaimEntity의 관련 컬럼들을 논리적으로 그룹핑하는 Embedded 클래스들입니다.
 * 테이블은 생성되지 않고, 컬럼은 claim 테이블에 저장됩니다.
 */

import { Column } from 'typeorm';
import type { Nullish } from '@src/types/utility.type';

/**
 * 사유 정보 Embedded
 * 참고: TypeORM이 프로퍼티명(reason)을 prefix로 자동 추가함
 *       → reason_text, reason_evidence_urls
 */
export class ClaimReasonInfo {
  /** 사유 (한글 텍스트) */
  @Column({ name: 'text', type: 'text' })
  text: string;

  /** 증빙자료 URL 목록 */
  @Column({ name: 'evidence_urls', type: 'jsonb', nullable: true })
  evidenceUrls: Nullish<string[]>;
}
