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
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { CampaignInfluencerEntity } from '@src/module/backoffice/domain/campaign-influencer.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

// Forward declaration for circular reference
import type {
  CampaignInfluencerHotelOptionEntity,
  CampaignInfluencerHotelOptionResponse,
} from '@src/module/backoffice/domain/campaign-influencer-hotel-option.entity';

// Response 타입 (Entity 파일 내에서 정의하여 순환 참조 방지)
export interface CampaignInfluencerProductResponse {
  campaignInfluencerProductId: number;
  productId: number;
  useCustomCommission: boolean;
  hotelOptions: CampaignInfluencerHotelOptionResponse[];
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
      useCustomCommission: this.useCustomCommission,
      hotelOptions: (this.hotelOptions ?? []).map(option =>
        option.toResponse()
      ),
    };
  }
}

export const getCampaignInfluencerProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CampaignInfluencerProductEntity);
