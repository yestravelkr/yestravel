import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { InfluencerManagerEntity } from '@src/module/backoffice/domain/influencer-manager.entity';
import { RoleEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
  InfluencerListResponse,
  CreateInfluencerManagerInput,
} from './influencer.dto';

@Injectable()
export class InfluencerService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(params: {
    page: number;
    limit: number;
    ids?: number[];
  }): Promise<InfluencerListResponse> {
    const { page, limit, ids } = params;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.repositoryProvider.InfluencerRepository.createQueryBuilder(
        'influencer'
      );

    // ids 필터가 있으면 해당 ID만 조회
    if (ids && ids.length > 0) {
      queryBuilder.where('influencer.id IN (:...ids)', { ids });
    }

    queryBuilder.orderBy('influencer.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async findById(id: number): Promise<InfluencerEntity> {
    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOne({
        where: { id },
        relations: ['socialMedias'],
      });

    if (!influencer) {
      throw new NotFoundException(`인플루언서를 찾을 수 없습니다 (ID: ${id})`);
    }

    return influencer;
  }

  async create(input: CreateInfluencerInput): Promise<InfluencerEntity> {
    // 중복 이름 체크
    const isDuplicateName =
      await this.repositoryProvider.InfluencerRepository.existsByName(
        input.name
      );

    if (isDuplicateName) {
      throw new ConflictException('이미 동일한 이름의 인플루언서가 존재합니다');
    }

    // 중복 slug 체크
    const isDuplicateSlug =
      await this.repositoryProvider.InfluencerRepository.existsBySlug(
        input.slug
      );

    if (isDuplicateSlug) {
      throw new ConflictException('이미 동일한 샵 URL이 존재합니다');
    }

    // 인플루언서 엔티티 생성
    const { socialMedias, ...data } = input;

    const influencer = Object.assign(new InfluencerEntity(), {
      ...data,
      socialMedias: socialMedias.map(sm =>
        this.repositoryProvider.SocialMediaRepository.create({
          platform: sm.platform,
          url: sm.url,
        })
      ),
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
      const isDuplicateName =
        await this.repositoryProvider.InfluencerRepository.existsByName(
          updateData.name,
          id
        );
      if (isDuplicateName) {
        throw new ConflictException(
          '이미 동일한 이름의 인플루언서가 존재합니다'
        );
      }
    }

    // slug 중복 체크 (다른 인플루언서와 중복되는 경우)
    if (updateData.slug !== existingInfluencer.slug) {
      const isDuplicateSlug =
        await this.repositoryProvider.InfluencerRepository.existsBySlug(
          updateData.slug,
          id
        );
      if (isDuplicateSlug) {
        throw new ConflictException('이미 동일한 샵 URL이 존재합니다');
      }
    }

    // 기존 소셜미디어 삭제
    if (existingInfluencer.socialMedias) {
      await this.repositoryProvider.SocialMediaRepository.remove(
        existingInfluencer.socialMedias
      );
    }

    // 인플루언서 정보 업데이트
    const { socialMedias, ...data } = updateData;

    Object.assign(existingInfluencer, {
      ...data,
      socialMedias: socialMedias.map(sm =>
        this.repositoryProvider.SocialMediaRepository.create({
          platform: sm.platform,
          url: sm.url,
        })
      ),
    });

    // cascade 옵션으로 socialMedias도 함께 저장됨
    return this.repositoryProvider.InfluencerRepository.save(
      existingInfluencer
    );
  }

  async createManager(
    dto: CreateInfluencerManagerInput
  ): Promise<InfluencerManagerEntity> {
    const { email, password, name, phoneNumber, influencerId } = dto;

    // 이메일 중복 체크
    const existing =
      await this.repositoryProvider.InfluencerManagerRepository.findOneBy({
        email,
      });
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOneByOrFail({
        id: influencerId,
      }).catch(() => {
        throw new NotFoundException('인플루언서를 찾을 수 없습니다');
      });

    const manager = await InfluencerManagerEntity.create({
      email,
      password,
      name,
      phoneNumber,
      role: dto.role ?? RoleEnum.PARTNER_SUPER,
      influencer,
    });

    return this.repositoryProvider.InfluencerManagerRepository.save(manager);
  }

  async findManagers(influencerId: number): Promise<InfluencerManagerEntity[]> {
    return this.repositoryProvider.InfluencerManagerRepository.find({
      where: { influencer: { id: influencerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteManager(
    id: number,
    influencerId: number
  ): Promise<{ success: boolean }> {
    const manager =
      await this.repositoryProvider.InfluencerManagerRepository.findOne({
        where: { id },
        relations: ['influencer'],
      });

    if (!manager) {
      throw new NotFoundException('매니저를 찾을 수 없습니다');
    }

    if (manager.role === RoleEnum.PARTNER_SUPER) {
      throw new ForbiddenException('SUPER 계정은 삭제할 수 없습니다');
    }

    if (manager.influencer.id !== influencerId) {
      throw new ForbiddenException(
        '다른 인플루언서의 매니저를 삭제할 수 없습니다'
      );
    }

    await this.repositoryProvider.InfluencerManagerRepository.softDelete(id);
    return { success: true };
  }

  async findManagerById(id: number): Promise<InfluencerManagerEntity> {
    const manager =
      await this.repositoryProvider.InfluencerManagerRepository.findOne({
        where: { id },
        relations: ['influencer'],
      });

    if (!manager) {
      throw new NotFoundException('매니저를 찾을 수 없습니다');
    }

    return manager;
  }
}
