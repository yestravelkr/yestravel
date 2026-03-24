import { Entity, Column, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import type { HotelCancelPolicyItem } from '@src/module/backoffice/domain/order/claim-detail.type';

export interface HappyCallConfig {
  useHappyCall: boolean;
  useGuide: boolean;
  happyCallLink: string | null;
  guideLink: string | null;
}

export interface CreateHotelProductInput {
  name: string;
  brandId: number;
  productTemplateId?: Nullish<number>;
  thumbnailUrls?: string[];
  description?: string;
  detailContent?: string;
  useStock?: boolean;
  useOptions?: boolean;
  price: number;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  displayOrder?: Nullish<number>;
  baseCapacity: number;
  maxCapacity: number;
  checkInTime: string;
  checkOutTime: string;
  bedTypes?: string[];
  tags?: string[];
  cancellationFees?: HotelCancelPolicyItem[];
  happyCallConfig?: HappyCallConfig | null;
}

export interface UpdateHotelProductInput extends CreateHotelProductInput {
  id: number;
}

/**
 * HotelProductEntity - 호텔 상품 엔티티
 *
 * ProductEntity를 상속받아 호텔 상품에 필요한 추가 컬럼을 정의합니다.
 * 같은 'product' 테이블을 사용하며, type='HOTEL'인 상품을 조회합니다.
 */
@Entity('product')
export class HotelProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.HOTEL;
    this.useCalendar = true; // 숙박은 항상 캘린더 사용
  }

  // 기준인원
  @Column({ type: 'integer', nullable: true })
  baseCapacity: Nullish<number>;

  // 최대인원
  @Column({ type: 'integer', nullable: true })
  maxCapacity: Nullish<number>;

  // 입실 시간
  @Column({ type: 'time', nullable: true })
  checkInTime: Nullish<string>;

  // 퇴실시간
  @Column({ type: 'time', nullable: true })
  checkOutTime: Nullish<string>;

  // 침대구성 (리스트)
  @Column('jsonb', { default: [], nullable: true })
  bedTypes: Nullish<string[]>;

  // 태그 (리스트)
  @Column('jsonb', { default: [], nullable: true })
  tags: Nullish<string[]>;

  // 취소 수수료 정책 (리스트)
  @Column('jsonb', { default: [], nullable: true })
  cancellationFees: Nullish<HotelCancelPolicyItem[]>;

  // 해피콜/이용가이드 설정
  @Column('jsonb', { nullable: true })
  happyCallConfig: Nullish<HappyCallConfig>;

  // 헬퍼 메서드: Entity 생성
  static createFromInput(input: CreateHotelProductInput): HotelProductEntity {
    const product = new HotelProductEntity();
    product.name = input.name;
    product.brandId = input.brandId;
    product.productTemplateId = input.productTemplateId || null;
    product.thumbnailUrls = input.thumbnailUrls || [];
    product.description = input.description || '';
    product.detailContent = input.detailContent || '';
    product.useStock = input.useStock || false;
    product.useOptions = input.useOptions || false;
    product.price = input.price;
    product.status = input.status || 'VISIBLE';
    product.displayOrder = input.displayOrder || null;
    product.baseCapacity = input.baseCapacity;
    product.maxCapacity = input.maxCapacity;
    product.checkInTime = input.checkInTime;
    product.checkOutTime = input.checkOutTime;
    product.bedTypes = input.bedTypes || [];
    product.tags = input.tags || [];
    product.cancellationFees = input.cancellationFees || [];
    product.happyCallConfig = input.happyCallConfig || null;
    return product;
  }

  // 헬퍼 메서드: Entity 업데이트
  updateFromInput(input: UpdateHotelProductInput): void {
    this.name = input.name;
    this.brandId = input.brandId;
    this.productTemplateId = input.productTemplateId || null;
    this.thumbnailUrls = input.thumbnailUrls || [];
    this.description = input.description || '';
    this.detailContent = input.detailContent || '';
    this.useStock = input.useStock || false;
    this.useOptions = input.useOptions || false;
    this.price = input.price;
    this.status = input.status || 'VISIBLE';
    this.displayOrder = input.displayOrder || null;
    this.baseCapacity = input.baseCapacity;
    this.maxCapacity = input.maxCapacity;
    this.checkInTime = input.checkInTime;
    this.checkOutTime = input.checkOutTime;
    this.bedTypes = input.bedTypes || [];
    this.tags = input.tags || [];
    this.cancellationFees = input.cancellationFees || [];
    this.happyCallConfig = input.happyCallConfig || null;
  }
}

export const getHotelProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelProductEntity);
