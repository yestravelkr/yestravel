import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
} from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductEntity } from './product.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  ProductOptionConfig,
  ProductSkuSelectorConfig,
} from '@yestravelkr/option-selector';

@Entity('product_option')
@Index(['productId'])
export class ProductOptionEntity
  extends SoftDeleteEntity
  implements ProductOptionConfig
{
  @Column({ name: 'product_id', type: 'integer' })
  productId: number;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer', default: 0 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * SKU 선택기 설정 (JSONB)
   * ProductSkuSelectorConfig[] 형태로 저장
   * 각 선택기는 선택 가능한 속성들과 해당 선택 시 한번에 선택되는 SKU 수량을 정의
   *
   * 예시:
   * [
   *   {
   *     selectableAttributes: { "color": ["red", "blue"], "size": ["S", "M", "L"] },
   *     quantity: 1  // 해당 조합 선택 시 SKU 1개가 선택됨
   *   },
   *   {
   *     selectableAttributes: { "flavor": ["vanilla", "chocolate", "strawberry"] },
   *     quantity: 3  // 해당 조합 선택 시 SKU 3개가 한번에 선택됨
   *   }
   * ]
   *
   * 골라담기를 구현하려면 배열에 여러 개의 선택기를 추가:
   * [
   *   { selectableAttributes: { "flavor": [...] }, quantity: 1 },
   *   { selectableAttributes: { "flavor": [...] }, quantity: 1 },
   *   { selectableAttributes: { "flavor": [...] }, quantity: 1 }
   * ]
   */
  @Column('jsonb', { name: 'sku_selectors', default: [] })
  skuSelectors: ProductSkuSelectorConfig[];
}

export const getProductOptionRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ProductOptionEntity);
