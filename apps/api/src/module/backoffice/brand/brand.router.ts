import {Ctx, Input, Mutation, Query, Router, UseMiddlewares} from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { 
  BackofficeAuthMiddleware,
  BackofficeAuthorizedContext
} from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { z } from 'zod';
import { 
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  updateBrandInputSchema,
  brandSchema,
  type RegisterBrandInput,
  type FindBrandByIdInput,
  type UpdateBrandInput
} from '@yestravelkr/api-types';

@Router({ alias: 'backofficeBrand' })
export class BrandRouter extends BaseTrpcRouter {
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: registerBrandInputSchema,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: RegisterBrandInput
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.register', input);
    return brandSchema.parse(output);
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(brandSchema),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send('backoffice.brand.findAll', {});
    return z.array(brandSchema).parse(output);
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findBrandByIdInputSchema,
    output: brandSchema.nullable(),
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindBrandByIdInput
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.findById', input);
    return brandSchema.nullable().parse(output);
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: updateBrandInputSchema,
    output: brandSchema,
  })
  async update(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateBrandInput
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.update', input);
    return brandSchema.parse(output);
  }
}