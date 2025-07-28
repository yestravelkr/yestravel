import { Router, Query, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { Ctx } from 'nestjs-trpc';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';

const businessInfoSchema = z.object({
  type: z.nativeEnum(BusinessType).optional(),
  name: z.string().optional(),
  licenseNumber: z.string().optional(),
  ceoName: z.string().optional(),
});

const bankInfoSchema = z.object({
  name: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
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

@Router({ alias: 'backoffice.brand' })
export class BrandRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: registerBrandInput,
    output: brandSchema,
  })
  async register(
    @Ctx() ctx: BackofficeAuthorizedContext,
    input: z.infer<typeof registerBrandInput>
  ) {
    return this.microserviceClient.send('backoffice.brand.register', input);
  }
  
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(brandSchema),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    return this.microserviceClient.send('backoffice.brand.findAll', {});
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
    return this.microserviceClient.send('backoffice.brand.findById', input);
  }
}