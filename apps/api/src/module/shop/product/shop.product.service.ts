import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  ProductDetailResponse,
  GetProductDetailInput,
  HotelProductDetails,
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

    // 2. 공통 응답 데이터
    const baseResponse = {
      id: campaignInfluencerProduct.id,
      type: product.type,

      // 상품 정보
      name: product.name,
      thumbnailUrl: product.thumbnailUrls?.[0] ?? null,
      originalPrice: product.originalPrice,
      price: product.price,
      description: product.description || null,
      detailHtml: product.detailContent || null,

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

      // 인플루언서 정보
      influencer: {
        id: influencer.id,
        name: influencer.name,
        slug: influencer.slug ?? null,
        thumbnail: influencer.thumbnail ?? null,
      },
    };

    // 3. 상품 타입별 추가 정보 조회
    if (product.type === ProductTypeEnum.HOTEL) {
      const hotelDetails = await this.getHotelProductDetails(
        product.id,
        product.productTemplateId ?? null
      );

      return {
        ...baseResponse,
        baseCapacity: hotelDetails.baseCapacity,
        maxCapacity: hotelDetails.maxCapacity,
        checkInTime: hotelDetails.checkInTime,
        checkOutTime: hotelDetails.checkOutTime,
        options: {
          skus: hotelDetails.skus,
          hotelOptions: hotelDetails.hotelOptions,
        },
      };
    }

    if (product.type === ProductTypeEnum.DELIVERY) {
      // TODO: 배송 상품 추가 정보 조회
      return {
        ...baseResponse,
        baseCapacity: null,
        maxCapacity: null,
        checkInTime: null,
        checkOutTime: null,
        options: {
          skus: [],
          hotelOptions: [],
        },
      };
    }

    if (product.type === ProductTypeEnum['E-TICKET']) {
      // TODO: E-TICKET 상품 추가 정보 조회
      return {
        ...baseResponse,
        baseCapacity: null,
        maxCapacity: null,
        checkInTime: null,
        checkOutTime: null,
        options: {
          skus: [],
          hotelOptions: [],
        },
      };
    }

    // 알 수 없는 타입
    return {
      ...baseResponse,
      baseCapacity: null,
      maxCapacity: null,
      checkInTime: null,
      checkOutTime: null,
      options: {
        skus: [],
        hotelOptions: [],
      },
    };
  }

  /**
   * 호텔 상품 추가 정보 조회
   */
  private async getHotelProductDetails(
    productId: number,
    productTemplateId: number | null
  ): Promise<HotelProductDetails> {
    // HotelProduct 조회
    const hotelProduct =
      await this.repositoryProvider.HotelProductRepository.findOne({
        where: { id: productId },
      });

    // HotelOption 조회
    const hotelOptionEntities =
      await this.repositoryProvider.HotelOptionRepository.find({
        where: { productId },
      });

    const hotelOptions = hotelOptionEntities.map(option => ({
      id: option.id,
      name: option.name,
      priceByDate: option.priceByDate,
    }));

    // HotelSku 조회 (productTemplateId 기반)
    let skus: HotelProductDetails['skus'] = [];
    if (productTemplateId) {
      const hotelSkuEntities =
        await this.repositoryProvider.HotelSkuRepository.find({
          where: { productTemplateId },
          order: { date: 'ASC' },
        });

      skus = hotelSkuEntities.map(sku => ({
        id: sku.id,
        quantity: sku.quantity,
        date: sku.date,
      }));
    }

    return {
      baseCapacity: hotelProduct?.baseCapacity ?? null,
      maxCapacity: hotelProduct?.maxCapacity ?? null,
      checkInTime: hotelProduct?.checkInTime ?? null,
      checkOutTime: hotelProduct?.checkOutTime ?? null,
      hotelOptions,
      skus,
    };
  }
}
