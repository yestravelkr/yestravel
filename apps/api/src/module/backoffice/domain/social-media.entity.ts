import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';

// Social media platform as string literal union
type SocialMediaPlatform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK' | 'TWITTER' | 'OTHER';

@Entity('social_media')
export class SocialMediaEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'TWITTER', 'OTHER'],
    default: 'INSTAGRAM',
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
