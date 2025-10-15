import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type { PaginationQuery } from '@src/module/shared/schema/pagination.schema';

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

    // Raw Query 사용 - PostgreSQL INHERITS 호환
    // 부모 테이블(product_template)의 공통 컬럼만 조회
    const whereConditions: string[] = ['pt.deleted_at IS NULL'];
    const parameters: Record<string, any> = {};
    let paramIndex = 1;

    if (type) {
      whereConditions.push(`pt.type = $${paramIndex}`);
      parameters[`param${paramIndex}`] = type;
      paramIndex++;
    }
    if (name) {
      whereConditions.push(`pt.name ILIKE $${paramIndex}`);
      parameters[`param${paramIndex}`] = `%${name}%`;
      paramIndex++;
    }
    if (useStock !== undefined) {
      whereConditions.push(`pt.use_stock = $${paramIndex}`);
      parameters[`param${paramIndex}`] = useStock;
      paramIndex++;
    }
    if (brandIds && brandIds.length > 0) {
      whereConditions.push(`pt.brand_id = ANY($${paramIndex})`);
      parameters[`param${paramIndex}`] = brandIds;
      paramIndex++;
    }
    if (startDate && endDate) {
      const dateColumn =
        dateFilterType === 'CREATED_AT' ? 'pt.created_at' : 'pt.updated_at';
      whereConditions.push(
        `${dateColumn} BETWEEN $${paramIndex} AND $${paramIndex + 1}`
      );
      parameters[`param${paramIndex}`] = startDate;
      parameters[`param${paramIndex + 1}`] = endDate;
      paramIndex += 2;
    }

    const whereClause = whereConditions.join(' AND ');
    const orderByColumn =
      orderBy === 'createdAt'
        ? 'created_at'
        : orderBy === 'updatedAt'
          ? 'updated_at'
          : orderBy;

    // COUNT 쿼리
    const countQuery = `
      SELECT COUNT(*) as count
      FROM product_template pt
      WHERE ${whereClause}
    `;

    // 데이터 조회 쿼리 (공통 컬럼만)
    const dataQuery = `
      SELECT
        pt.id,
        pt.type,
        pt.name,
        pt.description,
        pt.thumbnail_urls,
        pt.detail_content,
        pt.brand_id,
        pt.use_stock,
        pt.created_at,
        pt.updated_at,
        b.name as brand_name
      FROM product_template pt
      LEFT JOIN brand b ON b.id = pt.brand_id AND b.deleted_at IS NULL
      WHERE ${whereClause}
      ORDER BY pt.${orderByColumn} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    parameters[`param${paramIndex}`] = limit;
    parameters[`param${paramIndex + 1}`] = (page - 1) * limit;

    // 쿼리 실행
    const paramValues = Object.values(parameters);
    const [countResult, dataResult] = await Promise.all([
      this.repositoryProvider.ProductTemplateRepository.query(
        countQuery,
        paramValues.slice(0, paramIndex - 1)
      ),
      this.repositoryProvider.ProductTemplateRepository.query(
        dataQuery,
        paramValues
      ),
    ]);

    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    // Response 포맷팅
    const formattedTemplates: ProductTemplateListItem[] = dataResult.map(
      (row: any) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        brandName: row.brand_name || '',
        categoryName: '', // TODO: 카테고리 연동 후 구현
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: row.use_stock,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
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
