import { Entity, Column, ChildEntity, EntityManager } from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template.entity';
import {
  ProductTypeEnum,
  DeliveryFeeTypeEnumType,
  DELIVERY_FEE_TYPE_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';
import { Nullish } from '@src/types/utility.type';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('delivery_template')
@ChildEntity(ProductTypeEnum.DELIVERY)
export class DeliveryTemplateEntity extends ProductTemplateEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.DELIVERY;
  }

  // TODO: 카테고리 선택 (Category 엔티티 연동 예정)
  // @Column({ name: 'category_id', type: 'integer', nullable: true })
  // categoryId: Nullish<number>;
  //
  // @ManyToOne(() => CategoryEntity)
  // @JoinColumn({ name: 'category_id' })
  // category: CategoryEntity;

  // 재고 사용 여부
  @Column({ name: 'use_stock', type: 'boolean', default: false })
  useStock: boolean;

  // 옵션 사용 여부
  @Column({ name: 'use_options', type: 'boolean', default: false })
  useOptions: boolean;

  // TODO: 옵션 설정 (ProductOption 엔티티 분리 예정)
  // @OneToMany(() => ProductOptionEntity, option => option.deliveryTemplate)
  // options: ProductOptionEntity[];

  // 배송비 설정 (유료 | 조건부 무료 | 무료)
  @Column({
    name: 'delivery_fee_type',
    type: 'enum',
    enum: DELIVERY_FEE_TYPE_ENUM_VALUE,
  })
  deliveryFeeType: DeliveryFeeTypeEnumType;

  // 배송 가능 지역 (도서산간, 제주 체크박스)
  @Column('text', { array: true, nullable: true })
  deliveryRestrictedAreas: Nullish<string[]>;

  // 배송비
  @Column({ name: 'delivery_fee', type: 'integer', nullable: true })
  deliveryFee: Nullish<number>;

  // 무료 배송 조건 (금액)
  @Column({ name: 'free_delivery_min_amount', type: 'integer', nullable: true })
  freeDeliveryMinAmount: Nullish<number>;

  // 반품 배송비
  @Column({ name: 'return_delivery_fee', type: 'integer', nullable: true })
  returnDeliveryFee: Nullish<number>;

  // 교환 배송비
  @Column({ name: 'exchange_delivery_fee', type: 'integer', nullable: true })
  exchangeDeliveryFee: Nullish<number>;

  // 도서산간 추가 배송비
  @Column({ name: 'remote_area_extra_fee', type: 'integer', nullable: true })
  remoteAreaExtraFee: Nullish<number>;

  // 제주도 추가 배송비
  @Column({ name: 'jeju_extra_fee', type: 'integer', nullable: true })
  jejuExtraFee: Nullish<number>;

  // 교환 및 반품 안내
  @Column('text', { nullable: true })
  exchangeReturnInfo: Nullish<string>;

  // 상품 정보 제공 고시
  @Column('text', { nullable: true })
  productInfoNotice: Nullish<string>;
}

export const getDeliveryTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(DeliveryTemplateEntity);