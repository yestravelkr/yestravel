import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  TableInheritance,
} from 'typeorm';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

export enum ProductType {
  HOTEL = 'HOTEL',
  'E-TICKET' = 'E-TICKET',
  DELIVERY = 'DELIVERY',
}

@Entity('product')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  type: ProductType;

  @Column({ name: 'campaign_id', type: 'integer' })
  campaignId: number;

  @OneToOne(() => CampaignEntity)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;
}
