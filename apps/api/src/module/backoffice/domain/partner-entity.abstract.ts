import { Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { BusinessInfoEntity } from '@src/module/backoffice/domain/business-info.entity';
import { BankEntity } from '@src/module/backoffice/domain/bank.entity';
import { Nullish } from '@src/types/nullish.type';

export abstract class PartnerEntity extends BaseEntity {
  @Column({ length: 100, type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: Nullish<string>;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: Nullish<string>;

  @Column({
    name: 'thumbnail',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  thumbnail: Nullish<string>;

  @Column(() => BusinessInfoEntity)
  businessInfo: Nullish<BusinessInfoEntity>;

  @Column(() => BankEntity)
  bankInfo: Nullish<BankEntity>;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Nullish<Date>;
}
