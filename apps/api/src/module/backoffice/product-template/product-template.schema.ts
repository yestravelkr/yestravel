import { z } from 'zod';
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';
import {
  paginationQuerySchema,
  createPaginatedResponseSchema,
} from '@src/module/shared/schema/pagination.schema';

// ========================================
// Enum 정의
// ========================================

// 날짜 필터 타입 (등록일/수정일)
export const DATE_FILTER_TYPE_ENUM_VALUE = [
  'CREATED_AT',
  'UPDATED_AT',
] as const;
export type DateFilterTypeEnumType =
  (typeof DATE_FILTER_TYPE_ENUM_VALUE)[number];
export const DateFilterTypeEnum: Record<
  DateFilterTypeEnumType,
  DateFilterTypeEnumType
> = {
  CREATED_AT: 'CREATED_AT',
  UPDATED_AT: 'UPDATED_AT',
};

// ========================================
// Query 스키마 (전체 조회 필터)
// ========================================

export const findAllProductTemplateQuerySchema = z
  .object({
    // 상품 타입 (숙박/배송상품/티켓)
    type: z.enum(PRODUCT_TYPE_ENUM_VALUE).optional(),

    // 품목명 검색 (템플릿 이름)
    name: z.string().optional(),

    // 날짜 필터 타입 (등록일/수정일)
    dateFilterType: z.enum(DATE_FILTER_TYPE_ENUM_VALUE).optional(),

    // 시작일
    startDate: z.string().datetime().optional(),

    // 종료일
    endDate: z.string().datetime().optional(),

    // 재고 관리 여부 (미지정 시 전체)
    useStock: z.boolean().optional(),

    // 연동 여부 (미지정 시 전체)
    isIntegrated: z.boolean().optional(),

    // 브랜드 ID 목록
    brandIds: z.array(z.number().int().positive()).optional(),

    // 카테고리 ID 목록
    categoryIds: z.array(z.number().int().positive()).optional(),
  })
  .merge(paginationQuerySchema);

// ========================================
// Response 스키마 (전체 조회 응답)
// ========================================

// 리스트 아이템 스키마
export const productTemplateListItemSchema = z.object({
  id: z.number(),
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  name: z.string(),
  brand: z.object({
    id: z.number(),
    name: z.string(),
  }),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
  isIntegrated: z.boolean(),
  useStock: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 리스트 응답 스키마 (제네릭 페이지네이션 사용)
export const productTemplateListResponseSchema = createPaginatedResponseSchema(
  productTemplateListItemSchema
);
