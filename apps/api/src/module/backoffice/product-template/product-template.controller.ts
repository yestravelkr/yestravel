import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductTemplateService } from './product-template.service';
import {
  findAllProductTemplateQuerySchema,
  productTemplateListResponseSchema,
  createProductTemplateInputSchema,
  createProductTemplateResponseSchema,
} from './product-template.schema';
import { z } from 'zod';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';

@Controller()
export class ProductTemplateController {
  constructor(
    private readonly productTemplateService: ProductTemplateService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeProductTemplate.findAll')
  async findAll(
    query: z.infer<typeof findAllProductTemplateQuerySchema>
  ): Promise<z.infer<typeof productTemplateListResponseSchema>> {
    // Service 호출
    const result = await this.productTemplateService.findAll(query);

    // Response schema 검증 및 반환
    return productTemplateListResponseSchema.parse(result);
  }

  @MessagePattern('backofficeProductTemplate.create')
  @Transactional
  async create(
    input: z.infer<typeof createProductTemplateInputSchema>
  ): Promise<z.infer<typeof createProductTemplateResponseSchema>> {
    // Input schema 검증
    const validatedInput = createProductTemplateInputSchema.parse(input);

    // Service 호출
    const result = await this.productTemplateService.create(validatedInput);

    // Response schema 검증 및 반환
    return createProductTemplateResponseSchema.parse(result);
  }
}
