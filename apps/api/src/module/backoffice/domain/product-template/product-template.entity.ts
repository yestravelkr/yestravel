import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  EntityManager,
} from 'typeorm';
import { SoftDeleteEntity } from '@src/module/backoffice/domain/base.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { CategoryEntity } from '@src/module/backoffice/domain/category.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  ProductTypeEnumType,
  PRODUCT_TYPE_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';

@Entity('product_template')
export class ProductTemplateEntity extends SoftDeleteEntity {
  // 상품 타입 (구분자)
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  // 상품 썸네일 (이미지 url 여러개가능)
  @Column('jsonb', { default: [] })
  thumbnailUrls: string[];

  // 상품명
  @Column()
  name: string;

  // 상품 설명
  @Column('text', { default: '' })
  description: string;

  // 상세페이지 내용 (HTML 태그 포함 에디터 콘텐츠)
  @Column('text', { default: '' })
  detailContent: string;

  // 브랜드 (브랜드 id로 연결)
  @Column({ name: 'brand_id', type: 'integer' })
  brandId: number;

  @ManyToOne(() => BrandEntity)
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  // 재고 사용 여부 (공통)
  @Column({ name: 'use_stock', type: 'boolean', default: false })
  useStock: boolean;

  // 정가 (원가)
  @Column({ name: 'original_price', type: 'integer', default: 0 })
  originalPrice: number;

  // 판매가 (할인가)
  @Column({ type: 'integer', default: 0 })
  price: number;

  // 카테고리 (Many-to-Many 관계)
  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'product_template_categories',
    joinColumn: { name: 'product_template_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];
}

export const getProductTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ProductTemplateEntity);
