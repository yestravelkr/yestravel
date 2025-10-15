import { z } from 'zod';

// ========================================
// 공통 페이지네이션 스키마
// ========================================

// 정렬 순서
export const ORDER_ENUM_VALUE = ['ASC', 'DESC'] as const;
export type OrderEnumType = (typeof ORDER_ENUM_VALUE)[number];

// 페이지네이션 쿼리 (Request - Page 방식)
export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).default(1), // 1부터 시작
  limit: z.number().int().positive().default(30), // 기본 30개
  orderBy: z.string().optional(), // 정렬 대상 필드 (예: 'createdAt', 'updatedAt', 'name')
  order: z.enum(ORDER_ENUM_VALUE).default('DESC'), // 정렬 순서 (기본: 최신순)
});

// 페이지네이션 메타 정보 (Response)
export const paginationMetaSchema = z.object({
  total: z.number(), // 전체 개수
  page: z.number(), // 현재 페이지
  limit: z.number(), // 페이지당 개수
  totalPages: z.number(), // 전체 페이지 수
});

// 제네릭 페이지네이션 응답 스키마 생성 함수
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z
    .object({
      data: z.array(dataSchema),
    })
    .merge(paginationMetaSchema);

// 페이지네이션 타입
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
