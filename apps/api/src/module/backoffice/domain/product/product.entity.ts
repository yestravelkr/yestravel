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
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template/product-template.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';
import {
  ProductTypeEnumType,
  PRODUCT_TYPE_ENUM_VALUE,
  ProductStatusEnumType,
  PRODUCT_STATUS_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';

@Entity('product')
export class ProductEntity extends SoftDeleteEntity {
  // 상품 타입 (구분자)
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  // 품목 템플릿 참조 (선택적 - 템플릿 없이도 상품 생성 가능)
  @Column({ name: 'product_template_id', type: 'integer', nullable: true })
  productTemplateId: Nullish<number>;

  @ManyToOne(() => ProductTemplateEntity, { nullable: true })
  @JoinColumn({ name: 'product_template_id' })
  productTemplate: Nullish<ProductTemplateEntity>;

  // 캠페인 참조 (선택적 - 캠페인에 등록될 수도, 안 될 수도)
  @Column({ name: 'campaign_id', type: 'integer', nullable: true })
  campaignId: Nullish<number>;

  @ManyToOne(() => CampaignEntity, { nullable: true })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Nullish<CampaignEntity>;

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

  // 카테고리 (Many-to-Many 관계)
  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];

  // 캘린더 사용 여부 (날짜별 가격/재고 관리)
  @Column({ name: 'use_calendar', type: 'boolean', default: false })
  useCalendar: boolean;

  // 재고 사용 여부
  @Column({ name: 'use_stock', type: 'boolean', default: false })
  useStock: boolean;

  // 옵션 사용 여부
  @Column({ name: 'use_options', type: 'boolean', default: false })
  useOptions: boolean;

  // 기본 판매가
  @Column({ type: 'integer' })
  price: number;

  // 상품 상태 (노출/미노출/품절)
  @Column({
    type: 'enum',
    enum: PRODUCT_STATUS_ENUM_VALUE,
    default: 'VISIBLE',
  })
  status: ProductStatusEnumType;

  // 정렬 순서
  @Column({ name: 'display_order', type: 'integer', nullable: true })
  displayOrder: Nullish<number>;
}

export interface FindAllProductQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  type?: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name?: string;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  brandIds?: number[];
  startDate?: string;
  endDate?: string;
  dateFilterType?: 'CREATED_AT' | 'UPDATED_AT';
}

export const getProductRepository = (
  source?: TransactionService | EntityManager
) =>
  getEntityManager(source)
    .getRepository(ProductEntity)
    .extend({
      async findAllWithFilters(
        query: FindAllProductQuery
      ): Promise<[ProductEntity[], number]> {
        // Default 값 처리
        const {
          page = 1,
          limit = 30,
          orderBy = 'createdAt',
          order = 'DESC',
          type,
          name,
          status,
          brandIds,
          dateFilterType = 'CREATED_AT',
          startDate,
          endDate,
        } = query;

        // QueryBuilder 생성
        const queryBuilder = this.createQueryBuilder(
          'product'
        ).leftJoinAndSelect('product.brand', 'brand');

        // WHERE 조건 적용
        if (type) {
          queryBuilder.andWhere('product.type = :type', { type });
        }
        if (name) {
          queryBuilder.andWhere('product.name LIKE :name', {
            name: `%${name}%`,
          });
        }
        if (status) {
          queryBuilder.andWhere('product.status = :status', { status });
        }
        if (brandIds && brandIds.length > 0) {
          queryBuilder.andWhere('product.brandId IN (:...brandIds)', {
            brandIds,
          });
        }
        if (startDate && endDate) {
          const dateField =
            dateFilterType === 'CREATED_AT'
              ? 'product.createdAt'
              : 'product.updatedAt';
          queryBuilder.andWhere(
            `${dateField} BETWEEN :startDate AND :endDate`,
            {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
            }
          );
        }

        // 정렬 및 페이지네이션
        queryBuilder
          .orderBy(`product.${orderBy}`, order)
          .skip((page - 1) * limit)
          .take(limit);

        // 데이터 조회
        return queryBuilder.getManyAndCount();
      },
    });
