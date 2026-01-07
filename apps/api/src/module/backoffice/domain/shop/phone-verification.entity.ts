import {
  Column,
  CreateDateColumn,
  Entity,
  EntityManager,
  Index,
  IsNull,
  LessThan,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import dayjs from 'dayjs';

/**
 * PhoneVerificationEntity - 휴대폰 인증 엔티티
 *
 * SMS 인증번호 발송 및 검증에 사용됩니다.
 * 인증번호는 3분간 유효하며, 사용 후 verifiedAt이 설정됩니다.
 */
@Entity('phone_verification')
export class PhoneVerificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** 휴대폰 번호 */
  @Index('IDX_phone_verification_phone')
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  /** 인증번호 (6자리) */
  @Column({ type: 'varchar', length: 6 })
  code: string;

  /** 만료 시간 */
  @Index('IDX_phone_verification_expires_at')
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  /** 인증 완료 시간 */
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Nullish<Date>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export const getPhoneVerificationRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(PhoneVerificationEntity)
    .extend({
      /**
       * 유효한 인증번호 조회
       * @param phone 휴대폰 번호
       * @param code 인증번호
       */
      async findValidVerification(
        phone: string,
        code: string
      ): Promise<PhoneVerificationEntity | null> {
        return this.findOne({
          where: {
            phone,
            code,
            verifiedAt: IsNull(),
          },
          order: { createdAt: 'DESC' },
        });
      },

      /**
       * 인증 완료 처리
       * @param id 인증 ID
       */
      async markAsVerified(id: number): Promise<void> {
        await this.update(id, { verifiedAt: dayjs().toDate() });
      },

      /**
       * 만료된 인증번호 삭제 (정리용)
       */
      async deleteExpired(): Promise<void> {
        await this.delete({
          expiresAt: LessThan(dayjs().toDate()),
          verifiedAt: IsNull(),
        });
      },
    });

export type PhoneVerificationRepositoryType = ReturnType<
  typeof getPhoneVerificationRepository
>;
