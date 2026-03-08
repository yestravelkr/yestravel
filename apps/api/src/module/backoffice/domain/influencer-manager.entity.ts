import { Entity, EntityManager, ManyToOne } from 'typeorm';
import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { RoleEnumType } from '@src/module/backoffice/admin/admin.schema';

@Entity('influencer_manager')
export class InfluencerManagerEntity extends LoginEntity {
  @ManyToOne(
    () => InfluencerEntity,
    influencer => influencer.influencerManagers
  )
  influencer: InfluencerEntity;

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
    influencer: InfluencerEntity;
  }): Promise<InfluencerManagerEntity> {
    const manager = new InfluencerManagerEntity();
    manager.email = data.email;
    manager.name = data.name;
    manager.phoneNumber = data.phoneNumber;
    manager.role = data.role;
    manager.influencer = data.influencer;
    await manager.setPassword(data.password);
    return manager;
  }
}

export const getInfluencerManagerRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(InfluencerManagerEntity).extend({});
