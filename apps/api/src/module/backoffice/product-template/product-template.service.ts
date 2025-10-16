import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type {
  PaginationQuery,
  PaginatedResponse,
} from '@src/module/shared/schema/pagination.schema';

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
  brand: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  isIntegrated: boolean;
  useStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ProductTemplateListResponse = PaginatedResponse<ProductTemplateListItem>;

@Injectable()
export class ProductTemplateService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(
    query: FindAllProductTemplateQuery
  ): Promise<ProductTemplateListResponse> {
    const {
      page = 1,
      limit = 30,
      orderBy = 'createdAt',
      order = 'DESC',
      type,
      name,
      dateFilterType = 'CREATED_AT',
      startDate,
      endDate,
      useStock,
      brandIds,
    } = query;

    // QueryBuilder 사용 - 데코레이터 제거로 이제 안전하게 사용 가능
    const queryBuilder =
      this.repositoryProvider.ProductTemplateRepository.createQueryBuilder(
        'template'
      ).leftJoinAndSelect('template.brand', 'brand');

    // WHERE 조건 적용
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }
    if (name) {
      queryBuilder.andWhere('template.name LIKE :name', { name: `%${name}%` });
    }
    if (useStock !== undefined) {
      queryBuilder.andWhere('template.useStock = :useStock', { useStock });
    }
    if (brandIds && brandIds.length > 0) {
      queryBuilder.andWhere('template.brandId IN (:...brandIds)', { brandIds });
    }
    if (startDate && endDate) {
      const dateField =
        dateFilterType === 'CREATED_AT'
          ? 'template.createdAt'
          : 'template.updatedAt';
      queryBuilder.andWhere(`${dateField} BETWEEN :startDate AND :endDate`, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy(`template.${orderBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    // 데이터 조회
    const [templates, total] = await queryBuilder.getManyAndCount();

    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    // Response 포맷팅
    const formattedTemplates: ProductTemplateListItem[] = templates.map(
      template => ({
        id: template.id,
        type: template.type,
        name: template.name,
        brand: {
          id: template.brand?.id || 0,
          name: template.brand?.name || '',
        },
        category: {
          id: 0, // TODO: 카테고리 연동 후 구현
          name: '', // TODO: 카테고리 연동 후 구현
        },
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: template.useStock,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
    );

    return {
      data: formattedTemplates,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
