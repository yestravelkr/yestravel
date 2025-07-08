import { Column, DeleteDateColumn, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { RoleType } from '@src/module/backoffice/domain/role.enum';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

export class LoginEntity extends BaseEntity {
  @Column({ unique: true, length: 50, type: 'varchar' })
  email: string;

  @Column({ length: 20, type: 'varchar' })
  password: string;

  @Column({ length: 20, type: 'varchar' })
  name: string;

  @Column({ name: 'phone_number', length: 20, type: 'varchar' })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: RoleType,
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

export const getAdminRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(LoginEntity)
    .extend({
      async register(email: string, password: string): Promise<LoginEntity> {
        const admin = new LoginEntity();
        admin.email = email;
        await admin.setPassword(password);
        return this.save(admin);
      },
    });
