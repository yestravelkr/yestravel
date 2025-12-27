import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
  Unique,
  OneToMany,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { CampaignInfluencerEntity } from '@src/module/backoffice/domain/campaign-influencer.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  CAMPAIGN_STATUS_ENUM_VALUE,
  CampaignStatusEnum,
  type CampaignStatusEnumType,
} from '@src/module/backoffice/campaign/campaign.schema';

// Forward declaration for circular reference
import type {
  CampaignInfluencerHotelOptionEntity,
  CampaignInfluencerHotelOptionResponse,
} from '@src/module/backoffice/domain/campaign-influencer-hotel-option.entity';

// Response 타입 (Entity 파일 내에서 정의하여 순환 참조 방지)
export interface CampaignInfluencerProductResponse {
  campaignInfluencerProductId: number;
  productId: number;
  status: CampaignStatusEnumType;
  useCustomCommission: boolean;
  hotelOptions: CampaignInfluencerHotelOptionResponse[];
}

/**
 * 상품 요약 정보 (Shop 상품 상세용)
 */
export interface ProductSummary {
  id: number; // saleId (CampaignInfluencerProduct.id)
  thumbnailUrl: string | null;
  name: string;
  originalPrice: number;
  price: number;
}

/**
 * Shop 상품 정보 (인플루언서 페이지용)
 */
export interface ShopProductInfo {
  id: number; // product.id
  saleId: number; // CampaignInfluencerProduct.id
  name: string;
  thumbnail: string | null;
  originalPrice: number;
  price: number;
}

/**
 * CampaignInfluencerProduct Entity
 *
 * 인플루언서별 상품 설정을 관리합니다.
 * 판매 링크 URL의 기준이 됩니다: /sale/{id}
 */
@Entity('campaign_influencer_product')
@Unique(['campaignInfluencerId', 'productId'])
@Index(['campaignInfluencerId'])
@Index(['productId'])
export class CampaignInfluencerProductEntity extends BaseEntity {
  @Column({ name: 'campaign_influencer_id', type: 'varchar', length: 50 })
  campaignInfluencerId: string;

  @ManyToOne(() => CampaignInfluencerEntity)
  @JoinColumn({ name: 'campaign_influencer_id' })
  campaignInfluencer: CampaignInfluencerEntity;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  // 판매 페이지 상태 (VISIBLE, HIDDEN, SOLD_OUT)
  @Column({
    type: 'enum',
    enum: CAMPAIGN_STATUS_ENUM_VALUE,
    default: CampaignStatusEnum.VISIBLE,
  })
  status: CampaignStatusEnumType;

  // 별도 수수료 사용 여부
  @Column({ name: 'use_custom_commission', type: 'boolean', default: false })
  useCustomCommission: boolean;

  // 인플루언서별 호텔 옵션 수수료 목록
  @OneToMany(
    'CampaignInfluencerHotelOptionEntity',
    (hotelOption: CampaignInfluencerHotelOptionEntity) =>
      hotelOption.campaignInfluencerProduct
  )
  hotelOptions: CampaignInfluencerHotelOptionEntity[];

  toResponse(): CampaignInfluencerProductResponse {
    return {
      campaignInfluencerProductId: this.id,
      productId: this.productId,
      status: this.status,
      useCustomCommission: this.useCustomCommission,
      hotelOptions: (this.hotelOptions ?? []).map(option =>
        option.toResponse()
      ),
    };
  }

  /**
   * 상품 요약 정보 변환 (Shop 상품 상세용)
   *
   * product relation이 로드되어 있어야 합니다.
   */
  toProductSummary(): ProductSummary {
    return {
      id: this.id,
      thumbnailUrl: this.product.thumbnailUrls?.[0] ?? null,
      name: this.product.name,
      originalPrice: this.product.originalPrice,
      price: this.product.price,
    };
  }

  /**
   * Shop 상품 정보 변환 (인플루언서 페이지용)
   *
   * product relation이 로드되어 있어야 합니다.
   */
  toShopProduct(): ShopProductInfo {
    return {
      id: this.product.id,
      saleId: this.id,
      name: this.product.name,
      thumbnail: this.product.thumbnailUrls?.[0] ?? null,
      originalPrice: this.product.originalPrice,
      price: this.product.price,
    };
  }
}

export const getCampaignInfluencerProductRepository = (
  source?: TransactionService | EntityManager
) => {
  const repo = getEntityManager(source).getRepository(
    CampaignInfluencerProductEntity
  );

  return {
    ...repo,

    /**
     * saleId로 판매 상품 조회 (없으면 NotFoundException)
     *
     * @param saleId CampaignInfluencerProduct.id
     * @param relations 조회할 relation 목록
     */
    async findBySaleIdOrFail(
      saleId: number,
      relations: string[] = []
    ): Promise<CampaignInfluencerProductEntity> {
      const product = await repo.findOne({
        where: { id: saleId },
        relations,
      });

      if (!product) {
        throw new NotFoundException(
          `판매 상품을 찾을 수 없습니다 (ID: ${saleId})`
        );
      }

      return product;
    },
  };
};
