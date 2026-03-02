import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc-v2';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import {
  BackofficeAuthMiddleware,
  BackofficeAuthorizedContext,
} from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { z } from 'zod';
import {
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  updateBrandInputSchema,
  deleteBrandInputSchema,
  brandSchema,
  createBrandManagerInputSchema,
  createBrandManagerOutputSchema,
  findBrandManagersInputSchema,
  brandManagerListSchema,
} from './brand.schema';
import type {
  RegisterBrandInput,
  FindBrandByIdInput,
  UpdateBrandInput,
  DeleteBrandInput,
  CreateBrandManagerInput,
  FindBrandManagersInput,
} from './brand.type';

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
    const output = await this.microserviceClient.send(
      'backoffice.brand.register',
      input
    );
    return brandSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: z.array(brandSchema),
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send(
      'backoffice.brand.findAll',
      {}
    );
    return z.array(brandSchema).parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findBrandByIdInputSchema,
    output: brandSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindBrandByIdInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.brand.findById',
      input
    );
    return brandSchema.parse(output);
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
    const output = await this.microserviceClient.send(
      'backoffice.brand.update',
      input
    );
    return brandSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: deleteBrandInputSchema,
    output: z.object({ success: z.boolean() }),
  })
  async delete(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: DeleteBrandInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.brand.delete',
      input
    );
    return output;
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createBrandManagerInputSchema,
    output: createBrandManagerOutputSchema,
  })
  async createManager(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateBrandManagerInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.brand.createManager',
      input
    );
    return createBrandManagerOutputSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findBrandManagersInputSchema,
    output: brandManagerListSchema,
  })
  async findManagers(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindBrandManagersInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.brand.findManagers',
      input
    );
    return brandManagerListSchema.parse(output);
  }
}
