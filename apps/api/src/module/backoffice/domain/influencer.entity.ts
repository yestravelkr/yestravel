import { Entity, EntityManager, Not, OneToMany } from 'typeorm';
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
) =>
  getEntityManager(source)
    .getRepository(InfluencerEntity)
    .extend({
      /**
       * 이름 중복 여부 확인
       * @param name 확인할 이름
       * @param excludeId 제외할 ID (수정 시 자기 자신 제외)
       */
      async existsByName(name: string, excludeId?: number): Promise<boolean> {
        const where = excludeId ? { name, id: Not(excludeId) } : { name };
        return this.exists({ where });
      },
    });
