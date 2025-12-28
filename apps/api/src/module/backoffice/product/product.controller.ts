import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductService } from './product.service';
import {
  createProductInputSchema,
  updateProductInputSchema,
  createProductResponseSchema,
  updateProductResponseSchema,
  deleteProductResponseSchema,
} from './product.schema';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import type {
  CreateProductInputDto,
  CreateProductResponse,
  UpdateProductInputDto,
  UpdateProductResponse,
  DeleteProductResponse,
  ProductDetail,
  FindAllProductQuery,
  ProductListResponse,
} from './product.dto';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeProduct.findAll')
  async findAll(query: FindAllProductQuery): Promise<ProductListResponse> {
    return await this.productService.findAll(query);
  }

  @MessagePattern('backofficeProduct.findById')
  async findById(data: { id: number }): Promise<ProductDetail> {
    return await this.productService.findById(data.id);
  }

  @MessagePattern('backofficeProduct.create')
  @Transactional
  async create(input: CreateProductInputDto): Promise<CreateProductResponse> {
    const validatedInput = createProductInputSchema.parse(input);
    const result = await this.productService.create(validatedInput as any);
    return createProductResponseSchema.parse(result);
  }

  @MessagePattern('backofficeProduct.update')
  @Transactional
  async update(input: UpdateProductInputDto): Promise<UpdateProductResponse> {
    const validatedInput = updateProductInputSchema.parse(input);
    console.log(input, validatedInput);
    const result = await this.productService.update(validatedInput as any);
    return updateProductResponseSchema.parse(result);
  }

  @MessagePattern('backofficeProduct.delete')
  @Transactional
  async delete(data: { id: number }): Promise<DeleteProductResponse> {
    const result = await this.productService.delete(data.id);
    return deleteProductResponseSchema.parse(result);
  }
}
