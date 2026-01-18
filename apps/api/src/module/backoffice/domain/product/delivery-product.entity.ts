import { Entity, Column, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { DeliveryPolicyEntity } from '@src/module/backoffice/domain/delivery-policy.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import type { DeliveryFeeTypeEnumType } from '@src/module/backoffice/admin/admin.schema';

// 배송 정책 Input (Entity 메서드 제외, 데이터 필드만)
export interface DeliveryPolicyInput {
  deliveryFeeType: DeliveryFeeTypeEnumType;
  deliveryFee: number;
  freeDeliveryMinAmount: number;
  returnDeliveryFee: number;
  exchangeDeliveryFee: number;
  remoteAreaExtraFee: number;
  jejuExtraFee: number;
  isJejuRestricted: boolean;
  isRemoteIslandRestricted: boolean;
}

export interface CreateDeliveryProductInput {
  name: string;
  brandId: number;
  productTemplateId?: Nullish<number>;
  thumbnailUrls?: string[];
  description?: string;
  detailContent?: string;
  useCalendar?: boolean;
  useStock?: boolean;
  useOptions?: boolean;
  price: number;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  displayOrder?: Nullish<number>;
  delivery: DeliveryPolicyInput;
  exchangeReturnInfo?: string;
  productInfoNotice?: string;
}

export interface UpdateDeliveryProductInput extends CreateDeliveryProductInput {
  id: number;
}

/**
 * DeliveryProductEntity - 배송 상품 엔티티
 *
 * ProductEntity를 상속받아 배송 상품에 필요한 추가 컬럼을 정의합니다.
 * 같은 'product' 테이블을 사용하며, type='DELIVERY'인 상품을 조회합니다.
 */
@Entity('product')
export class DeliveryProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.DELIVERY;
  }

  // 배송 정책 (임베디드 컬럼)
  @Column(() => DeliveryPolicyEntity, { prefix: 'delivery' })
  delivery: Nullish<DeliveryPolicyEntity>;

  // 교환 및 반품 안내
  @Column('text', { default: '', nullable: true })
  exchangeReturnInfo: Nullish<string>;

  // 상품 정보 제공 고시
  @Column('text', { default: '', nullable: true })
  productInfoNotice: Nullish<string>;

  // 헬퍼 메서드: Entity 생성
  static createFromInput(
    input: CreateDeliveryProductInput
  ): DeliveryProductEntity {
    const product = new DeliveryProductEntity();
    product.name = input.name;
    product.brandId = input.brandId;
    product.productTemplateId = input.productTemplateId || null;
    product.thumbnailUrls = input.thumbnailUrls || [];
    product.description = input.description || '';
    product.detailContent = input.detailContent || '';
    product.useCalendar = input.useCalendar || false;
    product.useStock = input.useStock || false;
    product.useOptions = input.useOptions || false;
    product.price = input.price;
    product.status = input.status || 'VISIBLE';
    product.displayOrder = input.displayOrder || null;
    product.exchangeReturnInfo = input.exchangeReturnInfo || '';
    product.productInfoNotice = input.productInfoNotice || '';

    // 배송 정책 임베디드 객체 생성
    const delivery = new DeliveryPolicyEntity();
    Object.assign(delivery, input.delivery);
    product.delivery = delivery;

    return product;
  }

  // 헬퍼 메서드: Entity 업데이트
  updateFromInput(input: UpdateDeliveryProductInput): void {
    this.name = input.name;
    this.brandId = input.brandId;
    this.productTemplateId = input.productTemplateId || null;
    this.thumbnailUrls = input.thumbnailUrls || [];
    this.description = input.description || '';
    this.detailContent = input.detailContent || '';
    this.useCalendar = input.useCalendar || false;
    this.useStock = input.useStock || false;
    this.useOptions = input.useOptions || false;
    this.price = input.price;
    this.status = input.status || 'VISIBLE';
    this.displayOrder = input.displayOrder || null;
    this.exchangeReturnInfo = input.exchangeReturnInfo || '';
    this.productInfoNotice = input.productInfoNotice || '';

    // 배송 정책 임베디드 객체 업데이트
    const delivery = new DeliveryPolicyEntity();
    Object.assign(delivery, input.delivery);
    this.delivery = delivery;
  }
}

export const getDeliveryProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(DeliveryProductEntity);
