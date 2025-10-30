import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  EntityManager,
} from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template.entity';
import { CategoryEntity } from '@src/module/backoffice/domain/category.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

/**
 * ProductTemplate과 Category의 Many-to-Many 관계를 위한 중간 테이블
 *
 * 한 상품 템플릿은 여러 카테고리에 속할 수 있습니다.
 * 예: '제주 호텔 패키지' 상품은 '호텔 > 국내호텔 > 제주도' 카테고리에 속함
 */
@Entity('product_template_categories')
export class ProductTemplateCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_template_id', type: 'integer' })
  productTemplateId: number;

  @Column({ name: 'category_id', type: 'integer' })
  categoryId: number;

  @ManyToOne(() => ProductTemplateEntity)
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: ProductTemplateEntity;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @CreateDateColumn()
  createdAt: Date;
}

export const getProductTemplateCategoryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ProductTemplateCategoryEntity);
