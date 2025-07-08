import { Entity, OneToMany } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { SocialMediaEntity } from '@src/module/backoffice/domain/social-media.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';

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
