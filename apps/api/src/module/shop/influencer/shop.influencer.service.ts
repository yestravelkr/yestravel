import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CampaignStatusEnum } from '@src/module/backoffice/campaign/campaign.schema';
import type {
  ShopInfluencerResponse,
  ShopCampaignListResponse,
  ShopCampaignListItemResponse,
  ShopCampaignDetailResponse,
  ShopCampaignDetailProductResponse,
} from './shop.influencer.dto';

@Injectable()
export class ShopInfluencerService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * slug로 인플루언서 기본 정보 조회
   */
  async findBySlug(slug: string): Promise<ShopInfluencerResponse> {
    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOne({
        where: { slug },
        select: ['id', 'slug', 'name', 'thumbnail'],
      });

    if (!influencer || !influencer.slug) {
      throw new NotFoundException(
        `인플루언서를 찾을 수 없습니다 (slug: ${slug})`
      );
    }

    return {
      id: influencer.id,
      slug: influencer.slug,
      name: influencer.name,
      thumbnail: influencer.thumbnail ?? null,
    };
  }

  /**
   * 인플루언서가 진행 중인 캠페인 목록 조회
   */
  async getCampaigns(slug: string): Promise<ShopCampaignListResponse> {
    // slug로 인플루언서 조회
    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOne({
        where: { slug },
        select: ['id'],
      });

    if (!influencer) {
      throw new NotFoundException(
        `인플루언서를 찾을 수 없습니다 (slug: ${slug})`
      );
    }

    return this.getCampaignsByInfluencerId(influencer.id);
  }

  /**
   * 인플루언서 ID로 진행 중인 캠페인 목록 조회
   *
   * @param influencerId 인플루언서 ID
   * @param excludeCampaignId 제외할 캠페인 ID (상품 상세에서 현재 캠페인 제외용)
   */
  async getCampaignsByInfluencerId(
    influencerId: number,
    excludeCampaignId?: number
  ): Promise<ShopCampaignListResponse> {
    const now = new Date();

    // CampaignInfluencer를 통해 인플루언서의 캠페인 조회
    const queryBuilder =
      this.repositoryProvider.CampaignInfluencerRepository.createQueryBuilder(
        'ci'
      )
        .leftJoinAndSelect('ci.campaign', 'campaign')
        .leftJoinAndSelect('ci.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .where('ci.influencerId = :influencerId', { influencerId })
        .andWhere('ci.status = :status', { status: CampaignStatusEnum.VISIBLE })
        .andWhere('campaign.startAt <= :now', { now })
        .andWhere('campaign.endAt >= :now', { now })
        .orderBy('campaign.startAt', 'DESC');

    // 제외할 캠페인이 있으면 필터링
    if (excludeCampaignId !== undefined) {
      queryBuilder.andWhere('campaign.id != :excludeCampaignId', {
        excludeCampaignId,
      });
    }

    const campaignInfluencers = await queryBuilder.getMany();

    const campaigns: ShopCampaignListItemResponse[] = campaignInfluencers.map(
      campaignInfluencer => {
        const campaign = campaignInfluencer.campaign;

        // VISIBLE 상태인 상품만 필터링
        const visibleProducts = (campaignInfluencer.products ?? [])
          .filter(product => product.status === CampaignStatusEnum.VISIBLE)
          .map(campaignProduct => {
            const shopProduct = campaignProduct.toShopProduct();
            return {
              id: shopProduct.id,
              saleId: shopProduct.saleId,
              name: shopProduct.name,
              thumbnail: shopProduct.thumbnail,
            };
          });

        return {
          id: campaign.id,
          title: campaign.title,
          startAt: campaign.startAt,
          endAt: campaign.endAt,
          products: visibleProducts,
        };
      }
    );

    return { campaigns };
  }

  /**
   * 캠페인 상세 정보 조회
   * - 캠페인 정보: 이름, 기간
   * - 상품 리스트: 썸네일, 이름, 원가, 할인가
   */
  async getCampaignDetail(
    slug: string,
    campaignId: number
  ): Promise<ShopCampaignDetailResponse> {
    // slug로 인플루언서 조회
    const influencer =
      await this.repositoryProvider.InfluencerRepository.findOne({
        where: { slug },
        select: ['id'],
      });

    if (!influencer) {
      throw new NotFoundException(
        `인플루언서를 찾을 수 없습니다 (slug: ${slug})`
      );
    }

    const influencerId = influencer.id;
    const now = new Date();

    // CampaignInfluencer를 통해 해당 캠페인 조회
    const campaignInfluencer =
      await this.repositoryProvider.CampaignInfluencerRepository.createQueryBuilder(
        'ci'
      )
        .leftJoinAndSelect('ci.campaign', 'campaign')
        .leftJoinAndSelect('ci.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .where('ci.influencerId = :influencerId', { influencerId })
        .andWhere('campaign.id = :campaignId', { campaignId })
        .andWhere('ci.status = :status', { status: CampaignStatusEnum.VISIBLE })
        .andWhere('campaign.startAt <= :now', { now })
        .andWhere('campaign.endAt >= :now', { now })
        .getOne();

    if (!campaignInfluencer) {
      throw new NotFoundException(
        `캠페인을 찾을 수 없습니다 (ID: ${campaignId})`
      );
    }

    const campaign = campaignInfluencer.campaign;

    // VISIBLE 상태인 상품만 필터링하고 가격 정보 포함
    const products: ShopCampaignDetailProductResponse[] = (
      campaignInfluencer.products ?? []
    )
      .filter(
        campaignProduct => campaignProduct.status === CampaignStatusEnum.VISIBLE
      )
      .map(campaignProduct => campaignProduct.toShopProduct());

    return {
      id: campaign.id,
      title: campaign.title,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
      products,
    };
  }
}
