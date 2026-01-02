import { Column, Entity, EntityManager, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import { MemberEntity } from '@src/module/backoffice/domain/member.entity';

/**
 * SocialAccountEntity - 소셜 계정 연동 정보
 * 카카오, 네이버, 구글 OAuth 연동 정보 저장
 */
export const SOCIAL_PROVIDER_ENUM_VALUE = ['KAKAO', 'NAVER', 'GOOGLE'] as const;
export type SocialProviderEnumType = (typeof SOCIAL_PROVIDER_ENUM_VALUE)[number];
export const SocialProviderEnum: Record<SocialProviderEnumType, SocialProviderEnumType> = {
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
  GOOGLE: 'GOOGLE',
};

@Entity('social_account')
export class SocialAccountEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'integer' })
  memberId: number;

  @ManyToOne(() => MemberEntity, (member) => member.socialAccounts)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @Column({ type: 'enum', enum: SOCIAL_PROVIDER_ENUM_VALUE })
  provider: SocialProviderEnumType;

  @Column({ name: 'provider_id', type: 'varchar', length: 255 })
  providerId: string;

  @Column({ name: 'provider_email', type: 'varchar', length: 255, nullable: true })
  providerEmail: Nullish<string>;

  static create(
    memberId: number,
    provider: SocialProviderEnumType,
    providerId: string,
    providerEmail?: string
  ): SocialAccountEntity {
    const socialAccount = new SocialAccountEntity();
    socialAccount.memberId = memberId;
    socialAccount.provider = provider;
    socialAccount.providerId = providerId;
    socialAccount.providerEmail = providerEmail ?? null;
    return socialAccount;
  }
}

export const getSocialAccountRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source)
    .getRepository(SocialAccountEntity)
    .extend({
      async findByProviderAndProviderId(
        provider: SocialProviderEnumType,
        providerId: string
      ): Promise<SocialAccountEntity | null> {
        return this.findOne({
          where: { provider, providerId },
          relations: ['member'],
        });
      },

      async findByMemberId(memberId: number): Promise<SocialAccountEntity[]> {
        return this.find({
          where: { memberId },
        });
      },

      async linkAccount(
        memberId: number,
        provider: SocialProviderEnumType,
        providerId: string,
        providerEmail?: string
      ): Promise<SocialAccountEntity> {
        const socialAccount = SocialAccountEntity.create(memberId, provider, providerId, providerEmail);
        return this.save(socialAccount);
      },
    });
