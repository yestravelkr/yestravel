import {
  Column,
  Entity,
  EntityManager,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { AddressEntity } from '@src/module/backoffice/domain/order/address.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { MemberEntity } from './member.entity';

/**
 * MemberAddressEntity - 회원 배송지 엔티티
 *
 * 회원이 저장한 배송지 정보입니다.
 * 한 회원이 여러 배송지를 가질 수 있습니다.
 */
@Entity('member_address')
export class MemberAddressEntity extends SoftDeleteEntity {
  /** 회원 ID */
  @Index('IDX_member_address_member_id')
  @Column({ name: 'member_id', type: 'int' })
  memberId: number;

  /** 회원 */
  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  /** 배송지명 (예: 집, 회사) */
  @Column({ type: 'varchar', length: 50, nullable: true })
  label: string | null;

  /** 배송지 정보 (Embedded) */
  @Column(() => AddressEntity, { prefix: false })
  address: AddressEntity;

  /** 수령인 이름 */
  @Column({ name: 'recipient_name', type: 'varchar', length: 100, nullable: true })
  recipientName: string | null;

  /** 수령인 연락처 */
  @Column({ name: 'recipient_phone', type: 'varchar', length: 20, nullable: true })
  recipientPhone: string | null;

  /** 기본 배송지 여부 */
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
}

export const getMemberAddressRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(MemberAddressEntity)
    .extend({
      /**
       * 회원의 배송지 목록 조회
       * @param memberId 회원 ID
       */
      async findByMemberId(memberId: number): Promise<MemberAddressEntity[]> {
        return this.find({
          where: { memberId },
          order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
      },

      /**
       * 회원의 기본 배송지 조회
       * @param memberId 회원 ID
       */
      async findDefaultByMemberId(
        memberId: number
      ): Promise<MemberAddressEntity | null> {
        return this.findOne({
          where: { memberId, isDefault: true },
        });
      },

      /**
       * 기본 배송지 설정
       * 기존 기본 배송지는 해제됩니다.
       * @param memberId 회원 ID
       * @param addressId 배송지 ID
       */
      async setDefault(memberId: number, addressId: number): Promise<void> {
        // 기존 기본 배송지 해제
        await this.update({ memberId, isDefault: true }, { isDefault: false });
        // 새 기본 배송지 설정
        await this.update({ id: addressId, memberId }, { isDefault: true });
      },
    });

export type MemberAddressRepositoryType = ReturnType<
  typeof getMemberAddressRepository
>;