import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CampaignStatusEnum } from '@src/module/backoffice/campaign/campaign.schema';
import type {
  ShopInfluencerResponse,
  ShopCampaignListResponse,
  ShopCampaignListItemResponse,
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

    const influencerId = influencer.id;
    const now = new Date();

    // CampaignInfluencer를 통해 인플루언서의 캠페인 조회
    const campaignInfluencers =
      await this.repositoryProvider.CampaignInfluencerRepository.createQueryBuilder(
        'ci'
      )
        .leftJoinAndSelect('ci.campaign', 'campaign')
        .leftJoinAndSelect('ci.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .where('ci.influencerId = :influencerId', { influencerId })
        .andWhere('ci.status = :status', { status: CampaignStatusEnum.VISIBLE })
        .andWhere('campaign.startAt <= :now', { now })
        .andWhere('campaign.endAt >= :now', { now })
        .orderBy('campaign.startAt', 'DESC')
        .getMany();

    const campaigns: ShopCampaignListItemResponse[] = campaignInfluencers.map(
      campaignInfluencer => {
        const campaign = campaignInfluencer.campaign;

        // VISIBLE 상태인 상품만 필터링
        const visibleProducts = (campaignInfluencer.products ?? [])
          .filter(product => product.status === CampaignStatusEnum.VISIBLE)
          .map(campaignProduct => ({
            id: campaignProduct.product.id,
            saleId: campaignProduct.id,
            name: campaignProduct.product.name,
            thumbnail: campaignProduct.product.thumbnailUrls?.[0] ?? null,
          }));

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
}
