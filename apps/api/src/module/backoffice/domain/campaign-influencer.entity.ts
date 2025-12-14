import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import {
  CampaignStatusEnumType,
  CAMPAIGN_STATUS_ENUM_VALUE,
  CampaignPeriodTypeEnumType,
  CAMPAIGN_PERIOD_TYPE_ENUM_VALUE,
  CampaignFeeTypeEnumType,
  CAMPAIGN_FEE_TYPE_ENUM_VALUE,
} from '@src/module/backoffice/campaign/campaign.schema';

// Forward declaration for circular reference
import type {
  CampaignInfluencerProductEntity,
  CampaignInfluencerProductResponse,
} from '@src/module/backoffice/domain/campaign-influencer-product.entity';

// Response 타입 (Entity 파일 내에서 정의하여 순환 참조 방지)
export interface CampaignInfluencerResponse {
  campaignInfluencerId: string;
  influencerId: number;
  name: string;
  thumbnail: string | null;
  periodType: CampaignPeriodTypeEnumType;
  startAt: Date | null;
  endAt: Date | null;
  feeType: CampaignFeeTypeEnumType;
  fee: number | null;
  status: CampaignStatusEnumType;
  products: CampaignInfluencerProductResponse[];
}

/**
 * CampaignInfluencer Entity
 *
 * 캠페인에 참여하는 인플루언서 정보를 관리합니다.
 * 인플루언서 정보는 Influencer를 참조하며, 원본 수정 시 반영됩니다.
 *
 * id는 `${campaignId}_${influencerId}` 형식의 composite key입니다.
 */
@Entity('campaign_influencer')
@Index(['campaignId'])
@Index(['influencerId'])
export class CampaignInfluencerEntity {
  // Composite Primary Key: `${campaignId}_${influencerId}`
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'campaign_id', type: 'integer' })
  campaignId: number;

  @ManyToOne(() => CampaignEntity)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ name: 'influencer_id', type: 'integer' })
  influencerId: number;

  @ManyToOne(() => InfluencerEntity)
  @JoinColumn({ name: 'influencer_id' })
  influencer: InfluencerEntity;

  // 기간 타입: DEFAULT(캠페인 기간 사용) / CUSTOM(직접 입력)
  @Column({
    name: 'period_type',
    type: 'enum',
    enum: CAMPAIGN_PERIOD_TYPE_ENUM_VALUE,
    default: 'DEFAULT',
  })
  periodType: CampaignPeriodTypeEnumType;

  // CUSTOM일 때 시작일 (nullable)
  @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt: Nullish<Date>;

  // CUSTOM일 때 종료일 (nullable)
  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt: Nullish<Date>;

  // 진행비 타입: NONE(없음) / CUSTOM(직접 입력)
  @Column({
    name: 'fee_type',
    type: 'enum',
    enum: CAMPAIGN_FEE_TYPE_ENUM_VALUE,
    default: 'NONE',
  })
  feeType: CampaignFeeTypeEnumType;

  // 진행비 (nullable)
  @Column({ type: 'integer', nullable: true })
  fee: Nullish<number>;

  // 노출 상태 (VISIBLE/HIDDEN/SOLD_OUT)
  @Column({
    type: 'enum',
    enum: CAMPAIGN_STATUS_ENUM_VALUE,
    default: 'VISIBLE',
  })
  status: CampaignStatusEnumType;

  // 인플루언서별 상품 목록
  @OneToMany(
    'CampaignInfluencerProductEntity',
    (product: CampaignInfluencerProductEntity) => product.campaignInfluencer
  )
  products: CampaignInfluencerProductEntity[];

  toResponse(): CampaignInfluencerResponse {
    return {
      campaignInfluencerId: this.id,
      influencerId: this.influencerId,
      name: this.influencer?.name ?? '',
      thumbnail: this.influencer?.thumbnail ?? null,
      periodType: this.periodType,
      startAt: this.startAt ?? null,
      endAt: this.endAt ?? null,
      feeType: this.feeType,
      fee: this.fee ?? null,
      status: this.status,
      products: (this.products ?? []).map(product => product.toResponse()),
    };
  }
}

export const getCampaignInfluencerRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CampaignInfluencerEntity);
