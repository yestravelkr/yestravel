import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductType } from '@src/module/backoffice/domain/base-product.entity';

@Entity('campaign')
export class CampaignEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  startAt: string;

  @Column()
  endAt: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  productType: ProductType;
}
