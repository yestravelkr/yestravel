import { Column, Entity, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

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
}

export const getCampaignRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CampaignEntity);
