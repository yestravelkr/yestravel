import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { Entity, EntityManager } from 'typeorm';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('admin')
export class AdminEntity extends LoginEntity {}

export const getAdminRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(AdminEntity)
    .extend({
      async register(email: string, password: string): Promise<AdminEntity> {
        const admin = new AdminEntity();
        admin.email = email;
        await admin.setPassword(password);
        return this.save(admin);
      },
    });
