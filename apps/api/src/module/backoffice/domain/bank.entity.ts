import { Column } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

export class BankEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  name?: string;

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
}
