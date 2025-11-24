import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
} from 'typeorm';
import { ProductSku as IProductSku } from '@yestravelkr/option-selector';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template/product-template.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('sku')
@Index('IDX_sku_template_code', ['productTemplateId', 'skuCode'], {
  unique: true,
})
@Index('IDX_sku_template', ['productTemplateId'])
export class SkuEntity extends BaseEntity implements IProductSku {
  @Column({ name: 'sku_code' })
  skuCode: string;

  // SKU 이름
  @Column()
  name: string;

  // 재고 수량
  @Column({ type: 'integer', default: 0 })
  quantity: number;

  // SKU 속성 (color, size 등 JSON 형태로 저장)
  @Column('jsonb', { default: {} })
  attributes: Record<string, string>;

  // 품목 템플릿 ID
  @Column({ name: 'product_template_id', type: 'integer' })
  productTemplateId: number;

  @ManyToOne(() => ProductTemplateEntity)
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplateEntity;
}

export const getSkuRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source).getRepository(SkuEntity);
