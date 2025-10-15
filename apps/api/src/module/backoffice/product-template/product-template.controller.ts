import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductTemplateService } from './product-template.service';
import {
  findAllProductTemplateQuerySchema,
  productTemplateListResponseSchema,
} from './product-template.schema';
import { z } from 'zod';

@Controller()
export class ProductTemplateController {
  constructor(
    private readonly productTemplateService: ProductTemplateService
  ) {}

  @MessagePattern('backofficeProductTemplate.findAll')
  async findAll(
    query: z.infer<typeof findAllProductTemplateQuerySchema>
  ): Promise<z.infer<typeof productTemplateListResponseSchema>> {
    // Query schema 검증
    const validatedQuery = findAllProductTemplateQuerySchema.parse(query);

    // Service 호출
    const result = await this.productTemplateService.findAll(validatedQuery);

    // Response schema 검증 및 반환
    return productTemplateListResponseSchema.parse(result);
  }
}
