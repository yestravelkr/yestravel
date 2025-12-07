import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { CampaignInfluencerProductEntity } from '@src/module/backoffice/domain/campaign-influencer-product.entity';
import { HotelOptionEntity } from '@src/module/backoffice/domain/product/hotel-option.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

// Response 타입 (Entity 파일 내에서 정의하여 순환 참조 방지)
export interface CampaignInfluencerHotelOptionResponse {
  campaignInfluencerHotelOptionId: number;
  hotelOptionId: number;
  commissionByDate: Record<string, number>;
}

/**
 * CampaignInfluencerHotelOption Entity
 *
 * 인플루언서별 호텔 옵션 커스텀 수수료를 관리합니다.
 * 기본값은 HotelOption.anotherPriceByDate를 사용합니다.
 *
 * 참조 vs 복사:
 * - hotelOptionId: 원본 HotelOption 참조 (name, priceByDate는 여기서 조회)
 * - commissionByDate: 커스텀 수수료만 저장
 */
@Entity('campaign_influencer_hotel_option')
@Unique(['campaignInfluencerProductId', 'hotelOptionId'])
@Index(['campaignInfluencerProductId'])
@Index(['hotelOptionId'])
@Index(['influencerId'])
export class CampaignInfluencerHotelOptionEntity extends BaseEntity {
  @Column({ name: 'campaign_influencer_product_id', type: 'integer' })
  campaignInfluencerProductId: number;

  @ManyToOne(() => CampaignInfluencerProductEntity)
  @JoinColumn({ name: 'campaign_influencer_product_id' })
  campaignInfluencerProduct: CampaignInfluencerProductEntity;

  // 원본 HotelOption 참조 (name, priceByDate 조회용)
  @Column({ name: 'hotel_option_id', type: 'integer' })
  hotelOptionId: number;

  @ManyToOne(() => HotelOptionEntity)
  @JoinColumn({ name: 'hotel_option_id' })
  hotelOption: HotelOptionEntity;

  // 비정규화: 쿼리 편의를 위해 인플루언서 ID 저장
  @Column({ name: 'influencer_id', type: 'integer' })
  influencerId: number;

  @ManyToOne(() => InfluencerEntity)
  @JoinColumn({ name: 'influencer_id' })
  influencer: InfluencerEntity;

  /**
   * 날짜별 수수료 (JSONB)
   * Record<string, number> 형태로 저장
   *
   * 예시:
   * {
   *   "2025-01-15": 5000,
   *   "2025-01-16": 7000,
   *   "2025-01-17": 6000
   * }
   *
   * 날짜 형식: YYYY-MM-DD (체크인 날짜 기준)
   */
  @Column('jsonb', { name: 'commission_by_date', default: {} })
  commissionByDate: Record<string, number>;

  toResponse(): CampaignInfluencerHotelOptionResponse {
    return {
      campaignInfluencerHotelOptionId: this.id,
      hotelOptionId: this.hotelOptionId,
      commissionByDate: this.commissionByDate,
    };
  }
}

export const getCampaignInfluencerHotelOptionRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source).getRepository(CampaignInfluencerHotelOptionEntity);
