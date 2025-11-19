import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
} from './influencer.dto';

@Injectable()
export class InfluencerService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async create(input: CreateInfluencerInput): Promise<InfluencerEntity> {
    // 중복 이름 체크
    const existingInfluencer =
      await this.repositoryProvider.InfluencerRepository.findOneBy({
        name: input.name,
      });

    if (existingInfluencer) {
      throw new ConflictException('이미 동일한 이름의 인플루언서가 존재합니다');
    }

    // 인플루언서 엔티티 생성
    const influencer = new InfluencerEntity();
    influencer.name = input.name;
    influencer.email = input.email ?? undefined;
    influencer.phoneNumber = input.phoneNumber ?? undefined;
    influencer.thumbnail = input.thumbnail ?? undefined;
    influencer.businessInfo = input.businessInfo as any;
    influencer.bankInfo = input.bankInfo as any;

    // 소셜미디어 엔티티 생성
    influencer.socialMedias = input.socialMedias.map(sm => {
      const socialMedia = this.repositoryProvider.SocialMediaRepository.create({
        platform: sm.platform,
        url: sm.url,
      });
      return socialMedia;
    });

    // cascade 옵션으로 socialMedias도 함께 저장됨
    return this.repositoryProvider.InfluencerRepository.save(influencer);
  }

  async update(input: UpdateInfluencerInput): Promise<InfluencerEntity> {
    const { id, ...updateData } = input;

    // 인플루언서 존재 확인
    const existingInfluencer =
      await this.repositoryProvider.InfluencerRepository.findOne({
        where: { id },
        relations: ['socialMedias'],
      });

    if (!existingInfluencer) {
      throw new NotFoundException(`인플루언서를 찾을 수 없습니다 (ID: ${id})`);
    }

    // 이름 중복 체크 (다른 인플루언서와 중복되는 경우)
    if (updateData.name !== existingInfluencer.name) {
      const influencerWithSameName =
        await this.repositoryProvider.InfluencerRepository.findOneBy({
          name: updateData.name,
        });
      if (influencerWithSameName && influencerWithSameName.id !== id) {
        throw new ConflictException(
          '이미 동일한 이름의 인플루언서가 존재합니다'
        );
      }
    }

    // 기존 소셜미디어 삭제
    if (existingInfluencer.socialMedias) {
      await this.repositoryProvider.SocialMediaRepository.remove(
        existingInfluencer.socialMedias
      );
    }

    // 새 소셜미디어 엔티티 생성
    const newSocialMedias = updateData.socialMedias.map(sm =>
      this.repositoryProvider.SocialMediaRepository.create({
        platform: sm.platform,
        url: sm.url,
      })
    );

    // 인플루언서 정보 업데이트
    Object.assign(existingInfluencer, {
      name: updateData.name,
      email: updateData.email ?? undefined,
      phoneNumber: updateData.phoneNumber ?? undefined,
      thumbnail: updateData.thumbnail ?? undefined,
      businessInfo: updateData.businessInfo as any,
      bankInfo: updateData.bankInfo as any,
      socialMedias: newSocialMedias,
    });

    // cascade 옵션으로 socialMedias도 함께 저장됨
    return this.repositoryProvider.InfluencerRepository.save(
      existingInfluencer
    );
  }
}
