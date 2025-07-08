import { Entity, EntityManager, OneToMany } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';

@Entity('brand')
export class BrandEntity extends PartnerEntity {
  @OneToMany(() => BrandManagerEntity, brandManager => brandManager.brand)
  brandManagers: BrandManagerEntity[];
}

export const getBrandRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BrandEntity).extend({});
