import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  ProductDetailResponse,
  GetProductDetailInput,
} from './shop.product.dto';

@Injectable()
export class ShopProductService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 상품 상세 조회
   *
   * saleId(CampaignInfluencerProduct.id)를 통해 상품 상세 정보를 조회합니다.
   *
   * 조회 흐름:
   * 1. CampaignInfluencerProduct 조회 (with campaignInfluencer, product)
   * 2. Campaign, Influencer, Brand 정보 추출
   * 3. HotelProduct인 경우 HotelOption, HotelSku 조회
   */
  async getProductDetail(
    input: GetProductDetailInput
  ): Promise<ProductDetailResponse> {
    const { saleId } = input;

    // 1. CampaignInfluencerProduct 조회 (with relations)
    const campaignInfluencerProduct =
      await this.repositoryProvider.CampaignInfluencerProductRepository.findOne(
        {
          where: { id: saleId },
          relations: [
            'campaignInfluencer',
            'campaignInfluencer.campaign',
            'campaignInfluencer.influencer',
            'product',
            'product.brand',
          ],
        }
      );

    if (!campaignInfluencerProduct) {
      throw new NotFoundException(
        `판매 상품을 찾을 수 없습니다 (ID: ${saleId})`
      );
    }

    const { campaignInfluencer, product } = campaignInfluencerProduct;
    const { campaign, influencer } = campaignInfluencer;

    // 2. 호텔 상품인 경우 추가 정보 조회
    let hotelOptions: Array<{
      id: number;
      name: string;
      priceByDate: Record<string, number>;
    }> = [];
    let skus: Array<{
      id: number;
      quantity: number;
      date: string;
    }> = [];
    let baseCapacity: number | null = null;
    let maxCapacity: number | null = null;
    let checkInTime: string | null = null;
    let checkOutTime: string | null = null;

    if (product.type === ProductTypeEnum.HOTEL) {
      // HotelProduct 조회
      const hotelProduct =
        await this.repositoryProvider.HotelProductRepository.findOne({
          where: { id: product.id },
        });

      if (hotelProduct) {
        baseCapacity = hotelProduct.baseCapacity;
        maxCapacity = hotelProduct.maxCapacity;
        checkInTime = hotelProduct.checkInTime;
        checkOutTime = hotelProduct.checkOutTime;
      }

      // HotelOption 조회
      const hotelOptionEntities =
        await this.repositoryProvider.HotelOptionRepository.find({
          where: { productId: product.id },
        });

      hotelOptions = hotelOptionEntities.map(option => ({
        id: option.id,
        name: option.name,
        priceByDate: option.priceByDate,
      }));

      // HotelSku 조회 (productTemplateId 기반)
      if (product.productTemplateId) {
        const hotelSkuEntities =
          await this.repositoryProvider.HotelSkuRepository.find({
            where: { productTemplateId: product.productTemplateId },
            order: { date: 'ASC' },
          });

        skus = hotelSkuEntities.map(sku => ({
          id: sku.id,
          quantity: sku.quantity,
          date: sku.date,
        }));
      }
    }

    // 3. Response 생성
    return {
      id: campaignInfluencerProduct.id,
      type: product.type,

      // 상품 정보
      name: product.name,
      thumbnailUrl: product.thumbnailUrls?.[0] ?? null,
      originalPrice: product.originalPrice,
      price: product.price,
      description: product.description || null,
      detailHtml: product.detailContent || null,

      // 호텔 전용 정보
      baseCapacity,
      maxCapacity,
      checkInTime,
      checkOutTime,

      // 캠페인 정보
      campaign: {
        id: campaign.id,
        title: campaign.title,
        startAt: campaign.startAt,
        endAt: campaign.endAt,
      },

      // 브랜드 정보
      brand: {
        id: product.brand.id,
        name: product.brand.name,
      },

      // 인플루언서 정보 (shopInfluencerSchema와 동일한 필드명)
      influencer: {
        id: influencer.id,
        name: influencer.name,
        slug: influencer.slug ?? null,
        thumbnail: influencer.thumbnail ?? null,
      },

      // 옵션 정보
      options: {
        skus,
        hotelOptions,
      },
    };
  }
}
