import { Entity, EntityManager, OneToMany } from 'typeorm';
import { PartnerEntity } from '@src/module/backoffice/domain/partner-entity.abstract';
import { SocialMediaEntity } from '@src/module/backoffice/domain/social-media.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('influencer')
export class InfluencerEntity extends PartnerEntity {
  @OneToMany(() => SocialMediaEntity, socialMedia => socialMedia.influencer, {
    cascade: true,
  })
  socialMedias: SocialMediaEntity[];
}

export const getInfluencerRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(InfluencerEntity)
    .extend({
      async findByIdWithSocialMedias(
        id: number
      ): Promise<InfluencerEntity | null> {
        return this.findOne({
          where: { id },
          relations: ['socialMedias'],
        });
      },

      async findByPlatform(platform: string): Promise<InfluencerEntity[]> {
        return this.createQueryBuilder('influencer')
          .leftJoinAndSelect('influencer.socialMedias', 'socialMedia')
          .where('socialMedia.platform = :platform', { platform })
          .getMany();
      },

      async findActiveInfluencers(): Promise<InfluencerEntity[]> {
        return this.find({
          where: { deletedAt: null },
        });
      },
    });
