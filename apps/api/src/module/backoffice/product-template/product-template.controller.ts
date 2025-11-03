import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductTemplateService } from './product-template.service';
import {
  findAllProductTemplateQuerySchema,
  productTemplateListResponseSchema,
  createProductTemplateInputSchema,
  createProductTemplateResponseSchema,
  productTemplateDetailSchema,
  updateHotelTemplateInputSchema,
  updateDeliveryTemplateInputSchema,
  updateETicketTemplateInputSchema,
  updateProductTemplateResponseSchema,
  deleteProductTemplateResponseSchema,
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

  @MessagePattern('backofficeProductTemplate.findById')
  async findById(data: {
    id: number;
  }): Promise<z.infer<typeof productTemplateDetailSchema>> {
    // Service 호출
    const result = await this.productTemplateService.findById(data.id);

    // Response schema 검증 및 반환
    return productTemplateDetailSchema.parse(result);
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

  @MessagePattern('backofficeProductTemplate.update')
  @Transactional
  async update(
    input:
      | z.infer<typeof updateHotelTemplateInputSchema>
      | z.infer<typeof updateDeliveryTemplateInputSchema>
      | z.infer<typeof updateETicketTemplateInputSchema>
  ): Promise<z.infer<typeof updateProductTemplateResponseSchema>> {
    // Service 호출 (Service에서 타입 검증 수행)
    const result = await this.productTemplateService.update(input as any);

    // Response schema 검증 및 반환
    return updateProductTemplateResponseSchema.parse(result);
  }

  @MessagePattern('backofficeProductTemplate.delete')
  @Transactional
  async delete(data: {
    id: number;
  }): Promise<z.infer<typeof deleteProductTemplateResponseSchema>> {
    // Service 호출
    const result = await this.productTemplateService.delete(data.id);

    // Response schema 검증 및 반환
    return deleteProductTemplateResponseSchema.parse(result);
  }
}
