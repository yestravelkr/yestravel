import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { Entity, EntityManager } from 'typeorm';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { RoleType } from '@src/module/backoffice/admin/admin.schema';

@Entity('admin')
export class AdminEntity extends LoginEntity {
  update(data: { name: string; phoneNumber: string; role: RoleType }): void {
    this.name = data.name;
    this.phoneNumber = data.phoneNumber;
    this.role = data.role;
  }

  async updatePassword(newPassword: string): Promise<void> {
    await this.setPassword(newPassword);
  }

  static async create(data: { 
    email: string; 
    password: string; 
    name: string; 
    phoneNumber: string; 
    role: RoleType;
  }): Promise<AdminEntity> {
    const admin = new AdminEntity();
    admin.email = data.email;
    admin.name = data.name;
    admin.phoneNumber = data.phoneNumber;
    admin.role = data.role;
    await admin.setPassword(data.password);
    return admin;
  }
}

export const getAdminRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(AdminEntity)
    .extend({
      async register(
        email: string,
        password: string,
        name: string,
        phoneNumber: string,
        role: string
      ): Promise<AdminEntity> {
        const admin = new AdminEntity();
        admin.email = email;
        admin.name = name;
        admin.phoneNumber = phoneNumber;
        admin.role = role as RoleType;
        await admin.setPassword(password);
        return this.save(admin);
      },
    });
