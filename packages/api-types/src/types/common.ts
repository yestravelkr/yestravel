import { z } from 'zod';

export const DATE_FILTER_TYPE_ENUM_VALUE = [
  'CREATED_AT',
  'UPDATED_AT',
] as const;

export const ORDER_DIRECTION_ENUM_VALUE = ['ASC', 'DESC'] as const;

// Pagination helper schemas
export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().positive().default(30),
  orderBy: z.string().optional(),
  order: z.enum(ORDER_DIRECTION_ENUM_VALUE).default('DESC'),
});

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });
