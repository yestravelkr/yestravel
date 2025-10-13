import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  TableInheritance,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';
import {
  ProductTypeEnumType,
  PRODUCT_TYPE_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';

@Entity('product_template')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class ProductTemplateEntity extends BaseEntity {
  // 상품 타입 (구분자)
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  // 상품 썸네일 (이미지 url 여러개가능)
  @Column('text', { array: true, nullable: true })
  thumbnailUrls: Nullish<string[]>;

  // 상품명
  @Column()
  name: string;

  // 상품 설명
  @Column('text', { nullable: true })
  description: Nullish<string>;

  // 상세페이지 내용 (HTML 태그 포함 에디터 콘텐츠)
  @Column('text', { nullable: true })
  detailContent: Nullish<string>;

  // 브랜드 (브랜드 id로 연결)
  @Column({ name: 'brand_id', type: 'integer' })
  brandId: number;

  @ManyToOne(() => BrandEntity)
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;
}

export const getProductTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ProductTemplateEntity);
