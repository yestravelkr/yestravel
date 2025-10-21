import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { categorySchema, categoryListSchema } from './category.schema';
import type {
  CreateCategoryInput,
  Category,
  CategoryList,
  FindAllCategoriesInput,
} from './category.type';

@Controller()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backoffice.category.create')
  @Transactional
  async create(data: CreateCategoryInput): Promise<Category> {
    const category = await this.categoryService.create(data);
    return categorySchema.parse(category);
  }

  @MessagePattern('backoffice.category.findAll')
  async findAll(data?: FindAllCategoriesInput): Promise<CategoryList> {
    const categories = await this.categoryService.findAll(data);
    return categoryListSchema.parse(categories);
  }
}
