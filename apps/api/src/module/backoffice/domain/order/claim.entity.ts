import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import { MemberEntity } from '@src/module/backoffice/domain/shop/member.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { ClaimReasonInfo } from './claim-embedded';
import type { ProductTypeEnumType } from '@src/module/backoffice/admin/admin.schema';
import type { ClaimType, ClaimStatus } from './claim-type';
import type { ClaimDetail, ClaimOptionItem } from './claim-detail.type';

/**
 * ClaimEntity - 클레임(취소/반품 요청) 엔티티
 *
 * 고객이 Shop에서 요청한 취소/반품을 관리합니다.
 * BackOffice에서 승인/거절/완료 처리합니다.
 */
@Entity('claim')
@Index('IDX_claim_order_id', ['orderId'])
@Index('IDX_claim_member_id', ['memberId'])
@Index('IDX_claim_status', ['status'])
@Index('IDX_claim_type', ['type'])
export class ClaimEntity extends BaseEntity {
  // ===== 클레임 기본 정보 =====

  /** 클레임 타입: CANCEL | RETURN */
  @Column({ type: 'varchar', length: 20 })
  type: ClaimType;

  /** 상품 타입: HOTEL | E-TICKET | DELIVERY (조회 편의용) */
  @Column({ name: 'product_type', type: 'varchar', length: 20 })
  productType: ProductTypeEnumType;

  /** 클레임 상태: REQUESTED | APPROVED | REJECTED | COMPLETED */
  @Column({ type: 'varchar', length: 20, default: 'REQUESTED' })
  status: ClaimStatus;

  // ===== 주문 관계 =====

  /** 주문 ID */
  @Column({ name: 'order_id' })
  orderId: number;

  /** 주문 관계 */
  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // ===== 회원 관계 (내 클레임 조회용) =====

  /** 회원 ID */
  @Column({ name: 'member_id' })
  memberId: number;

  /** 회원 관계 */
  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  // ===== 사유 정보 (Embedded) =====

  /** 사유 정보 */
  @Column(() => ClaimReasonInfo)
  reason: ClaimReasonInfo;

  // ===== 클레임 옵션 아이템 =====

  /** 클레임 대상 옵션 목록 (JSONB) */
  @Column({ name: 'claim_option_items', type: 'jsonb' })
  claimOptionItems: ClaimOptionItem[];

  // ===== 타입별 상세 정보 =====

  /** 타입별 상세 정보 (JSONB) */
  @Column({ type: 'jsonb' })
  detail: ClaimDetail;
}

export const getClaimRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ClaimEntity);
