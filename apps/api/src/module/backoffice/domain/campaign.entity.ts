import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { BaseProductEntity } from '@src/module/backoffice/domain/base-product.entity';

@Entity('campaign')
export class CampaignEntity extends BaseEntity {
  @Column({
    type: 'varchar',
  })
  title: string;

  @Column({
    type: 'timestamptz',
  })
  startAt: Date;

  @Column({
    type: 'timestamptz',
  })
  endAt: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnail: string;

  @OneToOne(() => BaseProductEntity, product => product.campaign)
  product?: BaseProductEntity;
}
