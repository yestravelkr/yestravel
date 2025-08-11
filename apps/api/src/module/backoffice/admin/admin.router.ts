import { Router, Query, UseMiddlewares, Mutation, Input, Ctx } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';

@Router({ alias: 'backofficeAdmin' })
export class AdminRouter extends BaseTrpcRouter {
  // TODO: Add admin management endpoints
}