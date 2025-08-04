import { Entity, EntityManager, OneToMany } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { BrandManagerEntity } from '@src/module/backoffice/domain/brand-manager.entity';
import { type RegisterBrandInput } from '@yestravelkr/yestravel-schema';

@Entity('brand')
export class BrandEntity extends PartnerEntity {
  @OneToMany(() => BrandManagerEntity, brandManager => brandManager.brand)
  brandManagers: BrandManagerEntity[];
}

export const getBrandRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(BrandEntity).extend({
  async register(dto: RegisterBrandInput): Promise<BrandEntity> {
    const brand = new BrandEntity();
    brand.name = dto.name;
    brand.email = dto.email;
    brand.phoneNumber = dto.phoneNumber;
    
    if (dto.businessInfo) {
      brand.businessInfo = dto.businessInfo as any;
    }
    
    if (dto.bankInfo) {
      brand.bankInfo = dto.bankInfo as any;
    }
    
    return this.save(brand);
  },
});
