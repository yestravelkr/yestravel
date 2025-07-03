import { Column, Entity, EntityManager } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('brand')
export class BrandEntity extends PartnerEntity {
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'website_url', type: 'varchar', length: 255, nullable: true })
  websiteUrl?: string;
}

export const getBrandRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(BrandEntity)
    .extend({
      async findByBusinessRegistrationNumber(
        businessRegistrationNumber: string
      ): Promise<BrandEntity | null> {
        return this.findOne({
          where: { businessRegistrationNumber },
        });
      },

      async findActiveBrands(): Promise<BrandEntity[]> {
        return this.find({
          where: { deletedAt: null },
        });
      },
    });
