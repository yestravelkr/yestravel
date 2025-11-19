import { Entity, EntityManager, OneToMany } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { SocialMediaEntity } from '@src/module/backoffice/domain/social-media.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('influencer')
export class InfluencerEntity extends PartnerEntity {
  @OneToMany(() => SocialMediaEntity, socialMedia => socialMedia.influencer, {
    cascade: true,
  })
  socialMedias: SocialMediaEntity[];

  @OneToMany(
    () => InfluencerManagerEntity,
    influencerManager => influencerManager.influencer
  )
  influencerManagers: InfluencerManagerEntity[];
}

export const getInfluencerRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(InfluencerEntity);
