import { Entity, ManyToOne } from 'typeorm';
import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';

@Entity('brand_manager')
export class BrandManagerEntity extends LoginEntity {
  @ManyToOne(() => BrandEntity, brand => brand.brandManagers)
  brand: BrandEntity;
}
