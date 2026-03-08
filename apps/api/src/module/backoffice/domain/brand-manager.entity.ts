import { Entity, EntityManager, ManyToOne } from 'typeorm';
import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { RoleEnumType } from '@src/module/backoffice/admin/admin.schema';

@Entity('brand_manager')
export class BrandManagerEntity extends LoginEntity {
  @ManyToOne(() => BrandEntity, brand => brand.brandManagers)
  brand: BrandEntity;

  update(data: {
    name: string;
    phoneNumber: string;
    role: RoleEnumType;
  }): void {
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
    role: RoleEnumType;
    brand: BrandEntity;
  }): Promise<BrandManagerEntity> {
    const manager = new BrandManagerEntity();
    manager.email = data.email;
    manager.name = data.name;
    manager.phoneNumber = data.phoneNumber;
    manager.role = data.role;
    manager.brand = data.brand;
    await manager.setPassword(data.password);
    return manager;
  }
}

export const getBrandManagerRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BrandManagerEntity).extend({});
