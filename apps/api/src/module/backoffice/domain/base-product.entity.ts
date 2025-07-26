import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  TableInheritance,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';

export enum ProductType {
  HOTEL = 'HOTEL',
  'E-TICKET' = 'E-TICKET',
  DELIVERY = 'DELIVERY',
}

@Entity('product')
@TableInheritance({
  column: {
    type: 'enum',
    enum: ProductType,
  },
})
export abstract class BaseProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ name: 'campaign_id', type: 'integer' })
  campaignId: number;

  @OneToOne(() => CampaignEntity, campaign => campaign.product)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;
}
