import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CategoryEntity } from '@src/module/backoffice/domain/category.entity';
import type {
  CreateCategoryInput,
  FindAllCategoriesInput,
} from './category.type';

@Injectable()
export class CategoryService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 카테고리 생성
   * - parentId가 있으면 부모 카테고리 존재 확인 및 level 계산
   * - level 자동 설정 (최상위: 0, 하위: parent.level + 1)
   */
  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const { name, productType, parentId } = input;

    // 1. parentId가 있으면 부모 카테고리 존재 확인 및 level 계산
    let level = 0;

    if (parentId) {
      const parentCategory =
        await this.repositoryProvider.CategoryRepository.findOne({
          where: { id: parentId },
        });

      if (!parentCategory) {
        throw new NotFoundException('상위 카테고리를 찾을 수 없습니다');
      }

      level = parentCategory.level + 1;
    }

    // 2. 카테고리 저장
    const category = await this.repositoryProvider.CategoryRepository.save({
      name,
      productType,
      parentId,
      level,
    });

    return category;
  }

  /**
   * 카테고리 전체 조회
   * - productType으로 필터링 가능 (optional)
   * - 계층 구조 유지하여 반환
   */
  async findAll(input?: FindAllCategoriesInput): Promise<CategoryEntity[]> {
    const { productType } = input || {};

    const queryBuilder =
      this.repositoryProvider.CategoryRepository.createQueryBuilder('category');

    // productType 필터링
    if (productType) {
      queryBuilder.where('category.productType = :productType', {
        productType,
      });
    }

    // level 순서로 정렬 (계층 구조 유지)
    queryBuilder.orderBy('category.level', 'ASC');
    queryBuilder.addOrderBy('category.id', 'ASC');

    const categories = await queryBuilder.getMany();

    return categories;
  }
}
