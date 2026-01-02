import { Column, Entity, EntityManager, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import { SocialAccountEntity } from '@src/module/backoffice/domain/social-account.entity';

/**
 * MemberEntity - Shop 회원/비회원 Entity
 * SMS 인증으로 생성된 비회원(isGuest=true)과 소셜 로그인으로 전환된 회원(isGuest=false)을 관리
 */
export interface MemberAddress {
  zipCode: string;
  address1: string;
  address2: Nullish<string>;
}

@Entity('member')
export class MemberEntity extends SoftDeleteEntity {
  @Column({ name: 'phone_number', type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: Nullish<string>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: Nullish<string>;

  @Column({ type: 'jsonb', nullable: true })
  address: Nullish<MemberAddress>;

  @Column({ name: 'is_guest', type: 'boolean', default: true })
  isGuest: boolean;

  @OneToMany(() => SocialAccountEntity, (social) => social.member)
  socialAccounts: SocialAccountEntity[];

  update(data: { name?: string; email?: string; address?: MemberAddress }): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.address !== undefined) this.address = data.address;
  }

  convertToMember(): void {
    this.isGuest = false;
  }

  static create(phoneNumber: string): MemberEntity {
    const member = new MemberEntity();
    member.phoneNumber = phoneNumber;
    member.isGuest = true;
    return member;
  }
}

export const getMemberRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source)
    .getRepository(MemberEntity)
    .extend({
      async findByPhoneNumber(phoneNumber: string): Promise<MemberEntity | null> {
        return this.findOneBy({ phoneNumber });
      },

      async findOrCreateByPhoneNumber(phoneNumber: string): Promise<MemberEntity> {
        const existing = await this.findByPhoneNumber(phoneNumber);
        if (existing) return existing;

        const member = MemberEntity.create(phoneNumber);
        return this.save(member);
      },
    });
