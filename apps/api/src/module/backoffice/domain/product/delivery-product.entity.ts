import { Entity, Column, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { DeliveryPolicyEntity } from '@src/module/backoffice/domain/delivery-policy.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('delivery_product')
export class DeliveryProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.DELIVERY;
  }

  // 배송 정책 (임베디드 컬럼)
  @Column(() => DeliveryPolicyEntity, { prefix: 'delivery' })
  delivery: DeliveryPolicyEntity;

  // 교환 및 반품 안내
  @Column('text', { default: '' })
  exchangeReturnInfo: string;

  // 상품 정보 제공 고시
  @Column('text', { default: '' })
  productInfoNotice: string;
}

export const getDeliveryProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(DeliveryProductEntity);
