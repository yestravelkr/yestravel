import { Column, Entity, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';

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
  description: Nullish<string>;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  thumbnail: Nullish<string>;
}

export const getCampaignRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CampaignEntity);
