import {Router, Query, UseMiddlewares, Mutation, Input} from 'nestjs-trpc';
import { z } from 'zod';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';

const businessInfoSchema = z.object({
  type: z.nativeEnum(BusinessType).optional().nullable(),
  name: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  ceoName: z.string().optional().nullable(),
});

const bankInfoSchema = z.object({
  name: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
});

const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  businessInfo: businessInfoSchema.optional().nullable(),
  bankInfo: bankInfoSchema.optional().nullable(),
  createdAt: z.date(),
});

const registerBrandInput = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  businessInfo: businessInfoSchema.optional(),
  bankInfo: bankInfoSchema.optional(),
});

@Router({ alias: 'backofficeBrand' })
export class BrandRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: registerBrandInput,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: z.infer<typeof registerBrandInput>
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
    input: z.object({
      id: z.number(),
    }),
    output: brandSchema.nullable(),
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    input: { id: number }
  ) {
    const output = await this.microserviceClient.send('backoffice.brand.findById', input);
    return brandSchema.nullable().parse(output);
  }
}