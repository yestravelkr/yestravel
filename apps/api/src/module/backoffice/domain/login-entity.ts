import { Column, DeleteDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import {
  RoleEnumType,
  ROLE_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';

export class LoginEntity extends BaseEntity {
  @Column({ unique: true, length: 50, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ length: 20, type: 'varchar' })
  name: string;

  @Column({ name: 'phone_number', length: 20, type: 'varchar' })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: ROLE_ENUM_VALUE,
  })
  role: RoleEnumType;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
