import { Column, DeleteDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

// Role type as string literal union
type RoleType = 'ADMIN_SUPER' | 'ADMIN_STAFF' | 'PARTNER_SUPER' | 'PARTNER_STAFF';

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
    enum: ['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'],
  })
  role: RoleType;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  async setPassword(plainPassword: string): Promise<void> {
    this.password = await bcrypt.hash(plainPassword, 10);
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
