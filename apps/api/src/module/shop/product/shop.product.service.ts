import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import type {
  ProductDetailResponse,
  GetProductDetailInput,
  HotelProductDetails,
  SellerInfo,
  GetCampaignOtherProductsInput,
  CampaignOtherProductsResponse,
} from './shop.product.dto';
import type { BrandEntity } from '@src/module/backoffice/domain/brand.entity';

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
      await this.repositoryProvider.CampaignInfluencerProductCustomRepository.findBySaleIdOrFail(
        saleId,
        [
          'campaignInfluencer',
          'campaignInfluencer.campaign',
          'campaignInfluencer.influencer',
          'product',
          'product.brand',
        ]
      );

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

    // 3. 판매자 정보 (공통)
    const sellerInfo = this.getSellerInfo(product.brand);

    // 4. 상품 타입별 추가 정보 조회
    if (product.type === ProductTypeEnum.HOTEL) {
      const hotelDetails = await this.getHotelProductDetails(
        product.id,
        product.productTemplateId ?? null
      );

      return {
        ...baseResponse,
        type: 'HOTEL' as const,
        baseCapacity: hotelDetails.baseCapacity ?? 0,
        maxCapacity: hotelDetails.maxCapacity ?? 0,
        checkInTime: hotelDetails.checkInTime ?? '',
        checkOutTime: hotelDetails.checkOutTime ?? '',
        options: {
          skus: hotelDetails.skus,
          hotelOptions: hotelDetails.hotelOptions,
        },
        salesInfo: {
          seller: sellerInfo,
          accommodationInfo: {
            checkInTime: hotelDetails.checkInTime,
            checkOutTime: hotelDetails.checkOutTime,
            baseCapacity: hotelDetails.baseCapacity,
            maxCapacity: hotelDetails.maxCapacity,
            bedTypes: hotelDetails.bedTypes,
          },
        },
      };
    }

    if (product.type === ProductTypeEnum.DELIVERY) {
      // TODO: 배송 상품 salesInfo 추가 (deliveryInfo, exchangeReturnInfo, productInfoNotice)
      return {
        ...baseResponse,
        type: 'DELIVERY' as const,
        options: {},
        salesInfo: {
          seller: sellerInfo,
        },
      };
    }

    // E-TICKET 또는 알 수 없는 타입
    return {
      ...baseResponse,
      type: 'E-TICKET' as const,
      options: {},
      salesInfo: {
        seller: sellerInfo,
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
      bedTypes: hotelProduct?.bedTypes ?? [],
      hotelOptions,
      skus,
    };
  }

  /**
   * 판매자 정보 추출 (브랜드의 businessInfo에서)
   */
  private getSellerInfo(brand: BrandEntity): SellerInfo {
    const businessInfo = brand.businessInfo;

    return {
      companyName: businessInfo?.name ?? null,
      ceoName: businessInfo?.ceoName ?? null,
      address: businessInfo?.address ?? null,
      licenseNumber: businessInfo?.licenseNumber ?? null,
      mailOrderLicenseNumber: businessInfo?.mailOrderLicenseNumber ?? null,
    };
  }

  /**
   * 캠페인 다른 상품 조회
   *
   * 현재 상품(saleId)이 포함된 캠페인의 다른 상품들을 조회합니다.
   *
   * 조회 흐름:
   * 1. saleId로 CampaignInfluencerProduct 조회 → campaignId 획득
   * 2. 같은 캠페인의 다른 CampaignInfluencerProduct 조회 (현재 상품 제외)
   */
  async getCampaignOtherProducts(
    input: GetCampaignOtherProductsInput
  ): Promise<CampaignOtherProductsResponse> {
    const { saleId } = input;

    // 1. 현재 상품에서 캠페인 정보 조회
    const currentProduct =
      await this.repositoryProvider.CampaignInfluencerProductCustomRepository.findBySaleIdOrFail(
        saleId,
        ['campaignInfluencer', 'campaignInfluencer.campaign']
      );

    const campaign = currentProduct.campaignInfluencer.campaign;
    const campaignInfluencerId = currentProduct.campaignInfluencerId;

    // 2. 같은 CampaignInfluencer의 다른 상품들 조회 (현재 상품 제외)
    const otherProducts =
      await this.repositoryProvider.CampaignInfluencerProductRepository.find({
        where: { campaignInfluencerId },
        relations: ['product'],
      });

    // 현재 상품 제외 및 응답 형식 변환
    const products = otherProducts
      .filter(item => item.id !== saleId)
      .map(item => ({
        id: item.id,
        thumbnailUrl: item.product.thumbnailUrls?.[0] ?? null,
        name: item.product.name,
        originalPrice: item.product.originalPrice,
        price: item.product.price,
      }));

    return {
      campaign: {
        id: campaign.id,
        name: campaign.title,
        startAt: campaign.startAt,
        endAt: campaign.endAt,
      },
      products,
    };
  }
}
