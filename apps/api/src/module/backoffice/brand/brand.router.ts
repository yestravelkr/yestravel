import {Router, Query, UseMiddlewares, Mutation, Input} from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { z } from 'zod';
import { 
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  brandSchema
} from '@src/module/backoffice/brand/brand.schema';

@Router({ alias: 'backofficeBrand' })
export class BrandRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: registerBrandInputSchema,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof registerBrandInputSchema>
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
    @Input() input: z.infer<typeof findBrandByIdInputSchema>
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.findById', input);
    return brandSchema.nullable().parse(output);
  }
}