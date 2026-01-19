import { Column, Entity, EntityManager, Index, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import { MemberAddressEntity } from './member-address.entity';
import { SocialAccountEntity } from './social-account.entity';

/**
 * MemberEntity - Shop 회원 엔티티
 *
 * SMS 인증을 통해 가입한 Shop 회원 정보를 저장합니다.
 * 휴대폰 번호를 기준으로 회원을 식별합니다.
 */
@Entity('member')
export class MemberEntity extends SoftDeleteEntity {
  /** 휴대폰 번호 (unique) */
  @Index('IDX_member_phone', { unique: true })
  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  /** 회원 이름 */
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: Nullish<string>;

  /** 배송지 목록 */
  @OneToMany(() => MemberAddressEntity, address => address.member)
  addresses: MemberAddressEntity[];

  /** 소셜 계정 목록 */
  @OneToMany(() => SocialAccountEntity, socialAccount => socialAccount.member)
  socialAccounts: SocialAccountEntity[];
}

export const getMemberRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(MemberEntity)
    .extend({
      /**
       * 휴대폰 번호로 회원 조회
       * @param phone 휴대폰 번호
       */
      async findByPhone(phone: string): Promise<MemberEntity | null> {
        return this.findOne({ where: { phone } });
      },

      /**
       * 휴대폰 번호로 회원 조회 또는 생성
       * @param phone 휴대폰 번호
       */
      async findOrCreateByPhone(phone: string): Promise<MemberEntity> {
        const existing = await this.findByPhone(phone);
        if (existing) {
          return existing;
        }

        return this.save({ phone });
      },
    });

export type MemberRepositoryType = ReturnType<typeof getMemberRepository>;
