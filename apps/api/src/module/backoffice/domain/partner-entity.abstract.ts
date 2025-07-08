import { Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';

export abstract class PartnerEntity extends BaseEntity {
  @Column({ length: 100, type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({
    name: 'thumbnail',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  thumbnail?: string;

  // 사업자 정보
  @Column({
    name: 'business_type',
    type: 'enum',
    enum: BusinessType,
    nullable: true,
  })
  businessType?: BusinessType;

  @Column({
    name: 'business_registration_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  businessRegistrationNumber?: string;

  @Column({
    name: 'representative_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  representativeName?: string;

  // 은행 정보
  @Column({ name: 'bank_name', type: 'varchar', length: 50, nullable: true })
  bankName?: string;

  @Column({
    name: 'account_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  accountNumber?: string;

  @Column({
    name: 'account_holder',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  accountHolder?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  getBankInfo() {
    if (!this.bankName || !this.accountNumber || !this.accountHolder) {
      return null;
    }
    return {
      bankName: this.bankName,
      accountNumber: this.accountNumber,
      accountHolder: this.accountHolder,
    };
  }

  getBusinessInfo() {
    if (!this.businessType) {
      return null;
    }
    return {
      businessType: this.businessType,
      businessRegistrationNumber: this.businessRegistrationNumber,
      representativeName: this.representativeName,
      email: this.email,
    };
  }
}
