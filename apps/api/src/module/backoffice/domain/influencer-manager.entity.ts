import { Entity, ManyToOne } from 'typeorm';
import { LoginEntity } from '@src/module/backoffice/domain/login-entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';

@Entity('influencer_manager')
export class InfluencerManagerEntity extends LoginEntity {
  @ManyToOne(
    () => InfluencerEntity,
    influencer => influencer.influencerManagers
  )
  influencer: InfluencerEntity;
}
