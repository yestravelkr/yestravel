import { Entity, Column, EntityManager } from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template/product-template.entity';
import { DeliveryEntity } from '@src/module/backoffice/domain/delivery.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('delivery_template')
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

  // 옵션 사용 여부
  @Column({ name: 'use_options', type: 'boolean', default: false })
  useOptions: boolean;

  // TODO: 옵션 설정 (ProductOption 엔티티 분리 예정)
  // @OneToMany(() => ProductOptionEntity, option => option.deliveryTemplate)
  // options: ProductOptionEntity[];

  // 배송 정책 (임베디드 컬럼)
  @Column(() => DeliveryEntity, { prefix: 'delivery' })
  delivery: DeliveryEntity;

  // 교환 및 반품 안내
  @Column('text', { default: '' })
  exchangeReturnInfo: string;

  // 상품 정보 제공 고시
  @Column('text', { default: '' })
  productInfoNotice: string;
}

export const getDeliveryTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(DeliveryTemplateEntity);
