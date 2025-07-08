import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { SocialMediaPlatform } from '@src/module/backoffice/domain/social-media-platform.enum';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';

@Entity('social_media')
export class SocialMediaEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SocialMediaPlatform,
    default: SocialMediaPlatform.INSTAGRAM,
  })
  platform: SocialMediaPlatform;

  @Column({ type: 'text' })
  url: string;

  @Column({ name: 'influencer_id', type: 'integer' })
  influencerId: number;

  @ManyToOne(() => InfluencerEntity, influencer => influencer.socialMedias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'influencer_id' })
  influencer: InfluencerEntity;
}
