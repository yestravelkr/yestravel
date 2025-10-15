import { z } from 'zod';
import { MicroserviceClient } from '@src/module/trpc/microserviceClient';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';
import { Router, Query, Ctx, Input, UseMiddlewares } from 'nestjs-trpc';
import { BackofficeAuthMiddleware } from '@src/module/backoffice/auth/backoffice.auth.middleware';
import type { BackofficeAuthorizedContext } from '@src/module/backoffice/auth/backoffice.auth.middleware';

@Router({ alias: 'backofficeProductTemplate' })
export class ProductTemplateRouter extends BaseTrpcRouter {
  constructor(protected readonly microserviceClient: MicroserviceClient) {
    super(microserviceClient);
  }

  @UseMiddlewares(BackofficeAuthMiddleware)
  @Query({
    input: z
      .object({
        // 상품 타입
        type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']).optional(),
        // 품목명 검색
        name: z.string().optional(),
        // 날짜 필터 타입
        dateFilterType: z.enum(['CREATED_AT', 'UPDATED_AT']).optional(),
        // 시작일
        startDate: z.string().datetime().optional(),
        // 종료일
        endDate: z.string().datetime().optional(),
        // 재고 관리 여부
        useStock: z.boolean().optional(),
        // 연동 여부
        isIntegrated: z.boolean().optional(),
        // 브랜드 ID 목록
        brandIds: z.array(z.number().int().positive()).optional(),
        // 카테고리 ID 목록
        categoryIds: z.array(z.number().int().positive()).optional(),
        // 페이지네이션
        page: z.number().int().min(1).default(1),
        limit: z.number().int().positive().default(30),
        orderBy: z.string().optional(),
        order: z.enum(['ASC', 'DESC']).default('DESC'),
      })
      .optional()
      .default({}),
    output: z.object({
      data: z.array(
        z.object({
          id: z.number(),
          type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']),
          name: z.string(),
          brandName: z.string(),
          categoryName: z.string(),
          isIntegrated: z.boolean(),
          useStock: z.boolean(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })
      ),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  })
  async findAll(
    @Ctx() ctx: BackofficeAuthorizedContext,
    @Input()
    input?: {
      type?: string;
      name?: string;
      dateFilterType?: string;
      startDate?: string;
      endDate?: string;
      useStock?: boolean;
      isIntegrated?: boolean;
      brandIds?: number[];
      categoryIds?: number[];
      page?: number;
      limit?: number;
      orderBy?: string;
      order?: 'ASC' | 'DESC';
    }
  ) {
    return this.microserviceClient.send(
      'backofficeProductTemplate.findAll',
      input || {}
    );
  }
}
