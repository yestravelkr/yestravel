import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type { PaginationQuery } from '@src/module/shared/schema/pagination.schema';
import { FindOptionsWhere, Between, In, Like } from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template.entity';
import type { ProductTypeEnumType } from '@src/module/backoffice/admin/admin.schema';

interface FindAllProductTemplateQuery extends PaginationQuery {
  type?: string;
  name?: string;
  dateFilterType?: string;
  startDate?: string;
  endDate?: string;
  useStock?: boolean;
  isIntegrated?: boolean;
  brandIds?: number[];
  categoryIds?: number[];
}

interface ProductTemplateListItem {
  id: number;
  type: string;
  name: string;
  brandName: string;
  categoryName: string;
  isIntegrated: boolean;
  useStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductTemplateListResponse {
  templates: ProductTemplateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductTemplateService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(
    query: FindAllProductTemplateQuery
  ): Promise<ProductTemplateListResponse> {
    const {
      page,
      limit,
      orderBy = 'createdAt',
      order = 'DESC',
      type,
      name,
      dateFilterType = 'CREATED_AT',
      startDate,
      endDate,
      useStock,
      brandIds,
      categoryIds,
    } = query;

    // WHERE 조건 구성
    const where: FindOptionsWhere<ProductTemplateEntity> = {};

    // 타입 필터
    if (type) {
      where.type = type as ProductTypeEnumType;
    }

    // 품목명 검색 (LIKE)
    if (name) {
      where.name = Like(`%${name}%`);
    }

    // TODO: 카테고리 필터 (카테고리 엔티티 연동 후 구현)
    // if (categoryIds && categoryIds.length > 0) {
    //   where.categoryId = In(categoryIds);
    // }

    // 재고 관리 필터
    if (useStock !== undefined) {
      where.useStock = useStock;
    }

    // 브랜드 필터
    if (brandIds && brandIds.length > 0) {
      where.brandId = In(brandIds);
    }

    // 날짜 범위 필터
    if (startDate && endDate) {
      const dateField =
        dateFilterType === 'CREATED_AT' ? 'createdAt' : 'updatedAt';
      where[dateField] = Between(new Date(startDate), new Date(endDate));
    }

    // Repository에서 데이터 조회
    const [templates, total] =
      await this.repositoryProvider.ProductTemplateRepository.findAndCount({
        where,
        relations: ['brand'],
        select: {
          id: true,
          type: true,
          thumbnailUrls: true,
          name: true,
          description: true,
          detailContent: true,
          brandId: true,
          useStock: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [orderBy]: order,
        },
      });

    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    // Response 포맷팅
    const formattedTemplates: ProductTemplateListItem[] = templates.map(
      template => ({
        id: template.id,
        type: template.type,
        name: template.name,
        brandName: template.brand?.name || '',
        categoryName: '', // TODO: 카테고리 연동 후 구현
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: template.useStock,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
    );

    return {
      templates: formattedTemplates,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
