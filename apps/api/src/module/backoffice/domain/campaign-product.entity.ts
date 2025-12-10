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
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  CampaignStatusEnumType,
  CAMPAIGN_STATUS_ENUM_VALUE,
} from '@src/module/backoffice/campaign/campaign.schema';

// Response 타입 (Entity 파일 내에서 정의하여 순환 참조 방지)
export interface CampaignProductResponse {
  id: number;
  name: string;
  thumbnailUrls: string[];
  brand: {
    id: number;
    name: string;
  };
  categories: {
    id: number;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  campaignProductId: number;
  status: CampaignStatusEnumType;
}

/**
 * CampaignProduct Entity
 *
 * 캠페인에 포함된 상품 목록을 관리합니다.
 * 상품 정보는 Product를 참조하며, 원본 수정 시 반영됩니다.
 */
@Entity('campaign_product')
@Unique(['campaignId', 'productId'])
@Index(['campaignId'])
@Index(['productId'])
export class CampaignProductEntity extends BaseEntity {
  @Column({ name: 'campaign_id', type: 'integer' })
  campaignId: number;

  @ManyToOne(() => CampaignEntity)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  // 노출 상태 (VISIBLE/HIDDEN/SOLD_OUT)
  @Column({
    type: 'enum',
    enum: CAMPAIGN_STATUS_ENUM_VALUE,
    default: 'VISIBLE',
  })
  status: CampaignStatusEnumType;

  toResponse(): CampaignProductResponse {
    return {
      id: this.product.id,
      name: this.product.name,
      thumbnailUrls: this.product.thumbnailUrls ?? [],
      brand: {
        id: this.product.brand.id,
        name: this.product.brand.name,
      },
      categories: (this.product.categories ?? []).map(category => ({
        id: category.id,
        name: category.name,
      })),
      createdAt: this.product.createdAt,
      updatedAt: this.product.updatedAt,
      campaignProductId: this.id,
      status: this.status,
    };
  }
}

export const getCampaignProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(CampaignProductEntity);
