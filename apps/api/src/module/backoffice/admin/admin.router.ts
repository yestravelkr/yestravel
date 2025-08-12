import { Router, Query, UseMiddlewares, Mutation, Input, Ctx } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { adminListSchema, adminDetailSchema, findAdminByIdInputSchema } from './admin.schema';
import type { FindAdminByIdInput } from './admin.type';

@Router({ alias: 'backofficeAdmin' })
export class AdminRouter extends BaseTrpcRouter {
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
}