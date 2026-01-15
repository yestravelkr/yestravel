import {
  Column,
  Entity,
  EntityManager,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import { MemberEntity } from './member.entity';

/**
 * 소셜 로그인 제공자 Enum
 */
export const SOCIAL_PROVIDER_ENUM_VALUE = [
  'KAKAO',
  'NAVER',
  'GOOGLE',
  'APPLE',
] as const;

export type SocialProviderEnumType =
  (typeof SOCIAL_PROVIDER_ENUM_VALUE)[number];

export const SocialProviderEnum = {
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
  GOOGLE: 'GOOGLE',
  APPLE: 'APPLE',
} as const;

/**
 * SocialAccountEntity - 소셜 로그인 계정 엔티티
 *
 * 회원의 소셜 로그인 계정 연동 정보를 저장합니다.
 * 한 회원이 여러 소셜 계정을 연동할 수 있습니다.
 */
@Entity('social_account')
@Unique(['provider', 'providerId'])
export class SocialAccountEntity extends BaseEntity {
  /** 회원 ID (FK) */
  @Index('IDX_social_account_member_id')
  @Column({ name: 'member_id', type: 'int' })
  memberId: number;

  /** 소셜 로그인 제공자 */
  @Column({ type: 'enum', enum: SOCIAL_PROVIDER_ENUM_VALUE })
  provider: SocialProviderEnumType;

  /** 소셜 서비스의 고유 ID */
  @Column({ name: 'provider_id', type: 'varchar', length: 100 })
  providerId: string;

  /** 소셜 계정 이메일 (선택) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: Nullish<string>;

  /** 회원 정보 */
  @ManyToOne(() => MemberEntity, (member) => member.socialAccounts)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}

export const getSocialAccountRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(SocialAccountEntity)
    .extend({
      /**
       * 소셜 제공자와 제공자 ID로 계정 조회
       * @param provider 소셜 제공자
       * @param providerId 제공자별 고유 ID
       */
      async findByProviderAccount(
        provider: SocialProviderEnumType,
        providerId: string
      ): Promise<SocialAccountEntity | null> {
        return this.findOne({
          where: { provider, providerId },
          relations: ['member'],
        });
      },

      /**
       * 회원의 소셜 계정 목록 조회
       * @param memberId 회원 ID
       */
      async findByMemberId(memberId: number): Promise<SocialAccountEntity[]> {
        return this.find({ where: { memberId } });
      },

      /**
       * 소셜 계정 연동
       * @param memberId 회원 ID
       * @param provider 소셜 제공자
       * @param providerId 제공자별 고유 ID
       * @param email 이메일 (선택)
       */
      async linkAccount(
        memberId: number,
        provider: SocialProviderEnumType,
        providerId: string,
        email?: string
      ): Promise<SocialAccountEntity> {
        const existing = await this.findByProviderAccount(provider, providerId);
        if (existing) {
          return existing;
        }

        return this.save({
          memberId,
          provider,
          providerId,
          email: email ?? null,
        });
      },
    });

export type SocialAccountRepositoryType = ReturnType<
  typeof getSocialAccountRepository
>;
