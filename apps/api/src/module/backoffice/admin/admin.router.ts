import { Router, Query, UseMiddlewares, Mutation, Input, Ctx } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { adminListSchema } from './admin.schema';

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
}