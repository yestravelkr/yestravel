import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import type { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';

export interface FindAllProductOptions {
  page: number;
  limit: number;
  orderBy: string;
  order: 'ASC' | 'DESC';
  type?: string;
  name?: string;
  status?: string;
  brandIds?: number[];
  dateFilterType?: 'CREATED_AT' | 'UPDATED_AT';
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAllWithFilters(
    options: FindAllProductOptions
  ): Promise<[ProductEntity[], number]> {
    const {
      page,
      limit,
      orderBy,
      order,
      type,
      name,
      status,
      brandIds,
      dateFilterType = 'CREATED_AT',
      startDate,
      endDate,
    } = options;

    // QueryBuilder 생성
    const queryBuilder =
      this.repositoryProvider.ProductRepository.createQueryBuilder(
        'product'
      ).leftJoinAndSelect('product.brand', 'brand');

    // WHERE 조건 적용
    if (type) {
      queryBuilder.andWhere('product.type = :type', { type });
    }
    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    if (brandIds && brandIds.length > 0) {
      queryBuilder.andWhere('product.brandId IN (:...brandIds)', { brandIds });
    }
    if (startDate && endDate) {
      const dateField =
        dateFilterType === 'CREATED_AT'
          ? 'product.createdAt'
          : 'product.updatedAt';
      queryBuilder.andWhere(`${dateField} BETWEEN :startDate AND :endDate`, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy(`product.${orderBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    // 데이터 조회
    return queryBuilder.getManyAndCount();
  }
}