import {
  Router,
  Query,
  UseMiddlewares,
  Mutation,
  Input,
  Ctx,
} from 'nestjs-trpc-v2';
import { TRPCError } from '@trpc/server';
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
  deleteAdminInputSchema,
  deleteAdminResponseSchema,
  RoleEnum,
} from './admin.schema';
import type {
  FindAdminByIdInput,
  UpdateAdminInput,
  UpdateAdminPasswordInput,
  CreateAdminInput,
  DeleteAdminInput,
} from './admin.type';

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
    const output = await this.microserviceClient.send(
      'backoffice.admin.create',
      input
    );
    return adminDetailSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    output: adminListSchema,
  })
  async findAll(@Ctx() ctx: BackofficeAuthorizedContext) {
    const output = await this.microserviceClient.send(
      'backoffice.admin.findAll',
      {}
    );
    return adminListSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAdminByIdInputSchema,
    output: adminDetailSchema,
  })
  async findById(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: FindAdminByIdInput
  ) {
    const output = await this.microserviceClient.send(
      'backoffice.admin.findById',
      input
    );
    return adminDetailSchema.parse(output);
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
    const output = await this.microserviceClient.send(
      'backoffice.admin.update',
      input
    );
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
    if (ctx.admin.role !== RoleEnum.ADMIN_SUPER) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'ADMIN_SUPER 권한이 필요합니다.',
      });
    }

    const output = await this.microserviceClient.send(
      'backoffice.admin.updatePassword',
      input
    );
    return updateAdminPasswordResponseSchema.parse(output);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Mutation({
    input: deleteAdminInputSchema,
    output: deleteAdminResponseSchema,
  })
  async delete(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input() input: DeleteAdminInput
  ) {
    if (ctx.admin.role !== RoleEnum.ADMIN_SUPER) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'ADMIN_SUPER 권한이 필요합니다.',
      });
    }

    if (ctx.admin.id === input.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '자기 자신은 삭제할 수 없습니다.',
      });
    }

    const output = await this.microserviceClient.send(
      'backoffice.admin.delete',
      input
    );
    return deleteAdminResponseSchema.parse(output);
  }
}
