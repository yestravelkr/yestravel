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
        const entity = await this.findOne({ where });
        return entity !== null;
      },

      /**
       * 여러 인플루언서 ID의 존재 여부를 한 번에 검증
       * @param ids 검증할 인플루언서 ID 배열
       * @throws NotFoundException 존재하지 않는 ID가 있을 경우
       */
      async validateExistsByIds(ids: number[]): Promise<void> {
        if (ids.length === 0) return;

        const existingInfluencers = await this.find({
          where: ids.map(id => ({ id })),
          select: ['id'],
        });

        const existingIds = new Set(
          existingInfluencers.map(
            (influencer: InfluencerEntity) => influencer.id
          )
        );
        const missingIds = ids.filter(id => !existingIds.has(id));

        if (missingIds.length > 0) {
          const { NotFoundException } = await import('@nestjs/common');
          throw new NotFoundException(
            `인플루언서를 찾을 수 없습니다 (ID: ${missingIds[0]})`
          );
        }
      },
    });
