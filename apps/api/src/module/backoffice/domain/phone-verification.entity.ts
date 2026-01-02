import { Column, Entity, EntityManager } from 'typeorm';
import dayjs from 'dayjs';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

/**
 * 인증번호 관련 상수
 */
const VERIFICATION_EXPIRES_MINUTES = 3;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * PhoneVerificationEntity - 휴대폰 인증번호 저장
 * PostgreSQL 기반 인증번호 관리 (Redis 대체)
 * 만료시간: 3분, 최대 시도횟수: 5회
 */
@Entity('phone_verification')
export class PhoneVerificationEntity extends BaseEntity {
  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'verification_code', type: 'varchar', length: 6 })
  verificationCode: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'attempt_count', type: 'integer', default: 0 })
  attemptCount: number;

  isExpired(): boolean {
    return dayjs().isAfter(dayjs(this.expiresAt));
  }

  isMaxAttemptReached(): boolean {
    return this.attemptCount >= MAX_VERIFICATION_ATTEMPTS;
  }

  incrementAttempt(): void {
    this.attemptCount += 1;
  }

  markAsVerified(): void {
    this.isVerified = true;
  }

  static create(
    phoneNumber: string,
    code: string,
    expiresInMinutes = VERIFICATION_EXPIRES_MINUTES
  ): PhoneVerificationEntity {
    const verification = new PhoneVerificationEntity();
    verification.phoneNumber = phoneNumber;
    verification.verificationCode = code;
    verification.expiresAt = dayjs().add(expiresInMinutes, 'minute').toDate();
    verification.isVerified = false;
    verification.attemptCount = 0;
    return verification;
  }

  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const getPhoneVerificationRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source)
    .getRepository(PhoneVerificationEntity)
    .extend({
      async findLatestByPhoneNumber(phoneNumber: string): Promise<PhoneVerificationEntity | null> {
        return this.findOne({
          where: { phoneNumber },
          order: { createdAt: 'DESC' },
        });
      },

      async createVerification(phoneNumber: string): Promise<PhoneVerificationEntity> {
        const code = PhoneVerificationEntity.generateCode();
        const verification = PhoneVerificationEntity.create(phoneNumber, code);
        return this.save(verification);
      },

      async deleteExpiredVerifications(): Promise<void> {
        await this.createQueryBuilder()
          .delete()
          .where('expires_at < :now', { now: new Date() })
          .andWhere('is_verified = :isVerified', { isVerified: false })
          .execute();
      },
    });
