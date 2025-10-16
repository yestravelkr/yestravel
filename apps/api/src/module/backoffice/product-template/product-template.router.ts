import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { Router, Query, Ctx, Input, UseMiddlewares } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import {
  findAllProductTemplateQuerySchema,
  productTemplateListItemSchema,
} from './product-template.schema';
import { createPaginatedResponseSchema } from '@src/module/shared/schema/pagination.schema';

@Router({ alias: 'backofficeProductTemplate' })
export class ProductTemplateRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: findAllProductTemplateQuerySchema.optional().default({}),
    output: createPaginatedResponseSchema(productTemplateListItemSchema),
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input()
    input?: z.infer<typeof findAllProductTemplateQuerySchema>
  ) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.findAll',
      input || {}
    );
  }
}
