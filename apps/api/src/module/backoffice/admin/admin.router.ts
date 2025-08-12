import { Router, Query, UseMiddlewares, Mutation, Input, Ctx } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { 
  adminListSchema, 
  adminDetailSchema, 
  findAdminByIdInputSchema, 
  updateAdminInputSchema,
  updateAdminPasswordInputSchema,
  updateAdminPasswordResponseSchema,
  createAdminInputSchema,
} from './admin.schema';
import type { FindAdminByIdInput, UpdateAdminInput, UpdateAdminPasswordInput, CreateAdminInput } from './admin.type';

@Router({ alias: 'backofficeAdmin' })
export class AdminRouter extends BaseTrpcRouter {
  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: createAdminInputSchema,
    output: adminDetailSchema,
  })
  async create(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: CreateAdminInput
  ) {
    const output = await this.microserviceClient.send('backoffice.admin.create', input);
    return adminDetailSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: adminListSchema,
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send('backoffice.admin.findAll', {});
    return adminListSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAdminByIdInputSchema,
    output: adminDetailSchema.nullable(),
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindAdminByIdInput
  ) {
    const output = await this.microserviceClient.send('backoffice.admin.findById', input);
    return adminDetailSchema.nullable().parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: updateAdminInputSchema,
    output: adminDetailSchema,
  })
  async update(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateAdminInput
  ) {
    const output = await this.microserviceClient.send('backoffice.admin.update', input);
    return adminDetailSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: updateAdminPasswordInputSchema,
    output: updateAdminPasswordResponseSchema,
  })
  async updatePassword(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: UpdateAdminPasswordInput
  ) {
    const output = await this.microserviceClient.send('backoffice.admin.updatePassword', input);
    return updateAdminPasswordResponseSchema.parse(output);
  }
}