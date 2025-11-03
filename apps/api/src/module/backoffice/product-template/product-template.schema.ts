import { z } from 'zod';
import {
  PRODUCT_TYPE_ENUM_VALUE,
  DELIVERY_FEE_TYPE_ENUM_VALUE,
} from '@src/module/backoffice/admin/admin.schema';
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
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  isIntegrated: z.boolean(),
  useStock: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 리스트 응답 스키마 (제네릭 페이지네이션 사용)
export const productTemplateListResponseSchema = createPaginatedResponseSchema(
  productTemplateListItemSchema
);

// ========================================
// Create Input 스키마
// ========================================

// 공통 필드 스키마 (모든 타입에서 사용)
const baseCreateInputSchema = z.object({
  // 상품명 (필수)
  name: z.string().min(1, '상품명은 필수입니다'),

  // 브랜드 ID (필수)
  brandId: z.number().int().positive('브랜드를 선택해주세요'),

  // 카테고리 ID 배열 (선택)
  categoryIds: z.array(z.number().int().positive()).default([]),

  // 썸네일 URL 배열 (선택)
  thumbnailUrls: z.array(z.string().url()).default([]),

  // 상품 설명 (선택)
  description: z.string().default(''),

  // 상세페이지 내용 (선택)
  detailContent: z.string().default(''),

  // 재고 사용 여부 (선택)
  useStock: z.boolean().default(false),
});

// Delivery 임베디드 스키마
const deliveryEmbeddedSchema = z.object({
  // 배송비 타입 (필수)
  deliveryFeeType: z.enum(DELIVERY_FEE_TYPE_ENUM_VALUE),

  // 배송비 (선택)
  deliveryFee: z.number().int().nonnegative().default(0),

  // 무료 배송 최소 금액 (선택)
  freeDeliveryMinAmount: z.number().int().nonnegative().default(0),

  // 반품 배송비 (선택)
  returnDeliveryFee: z.number().int().nonnegative().default(0),

  // 교환 배송비 (선택)
  exchangeDeliveryFee: z.number().int().nonnegative().default(0),

  // 도서산간 추가 배송비 (선택)
  remoteAreaExtraFee: z.number().int().nonnegative().default(0),

  // 제주도 추가 배송비 (선택)
  jejuExtraFee: z.number().int().nonnegative().default(0),

  // 제주 배송 제한 여부 (선택)
  isJejuRestricted: z.boolean().default(false),

  // 도서산간 배송 제한 여부 (선택)
  isRemoteIslandRestricted: z.boolean().default(false),
});

// Hotel 생성 스키마
export const createHotelTemplateInputSchema = baseCreateInputSchema.extend({
  type: z.literal('HOTEL'),

  // 기준인원 (필수)
  baseCapacity: z.number().int().positive('기준인원은 1명 이상이어야 합니다'),

  // 최대인원 (필수)
  maxCapacity: z.number().int().positive('최대인원은 1명 이상이어야 합니다'),

  // 입실 시간 (필수, HH:MM 형식)
  checkInTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      '입실 시간은 HH:MM 형식이어야 합니다'
    ),

  // 퇴실 시간 (필수, HH:MM 형식)
  checkOutTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      '퇴실 시간은 HH:MM 형식이어야 합니다'
    ),

  // 침대 구성 (선택)
  bedTypes: z.array(z.string()).default([]),

  // 태그 (선택)
  tags: z.array(z.string()).default([]),
});

// Delivery 생성 스키마
export const createDeliveryTemplateInputSchema = baseCreateInputSchema.extend({
  type: z.literal('DELIVERY'),

  // 옵션 사용 여부 (선택)
  useOptions: z.boolean().default(false),

  // 배송 정책 (필수, 임베디드)
  delivery: deliveryEmbeddedSchema,

  // 교환 및 반품 안내 (선택)
  exchangeReturnInfo: z.string().default(''),

  // 상품 정보 제공 고시 (선택)
  productInfoNotice: z.string().default(''),
});

// ETicket 생성 스키마
export const createETicketTemplateInputSchema = baseCreateInputSchema.extend({
  type: z.literal('E-TICKET'),

  // 재고 사용 여부 (선택)
  useStock: z.boolean().default(false),

  // 옵션 사용 여부 (선택)
  useOptions: z.boolean().default(false),
});

// 타입별 Discriminated Union 스키마
export const createProductTemplateInputSchema = z.discriminatedUnion('type', [
  createHotelTemplateInputSchema,
  createDeliveryTemplateInputSchema,
  createETicketTemplateInputSchema,
]);

// ========================================
// Create Response 스키마
// ========================================

export const createProductTemplateResponseSchema = z.object({
  id: z.number(),
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  name: z.string(),
  message: z.string(),
});

// ========================================
// FindById 스키마
// ========================================

// 공통 필드 스키마
const baseProductTemplateDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  brandId: z.number(),
  brand: z.object({
    id: z.number(),
    name: z.string(),
  }),
  categories: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  thumbnailUrls: z.array(z.string()),
  description: z.string(),
  detailContent: z.string(),
  useStock: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Hotel 상세 스키마
const hotelTemplateDetailSchema = baseProductTemplateDetailSchema.extend({
  type: z.literal('HOTEL'),
  baseCapacity: z.number(),
  maxCapacity: z.number(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  bedTypes: z.array(z.string()),
  tags: z.array(z.string()),
});

// Delivery 상세 스키마
const deliveryTemplateDetailSchema = baseProductTemplateDetailSchema.extend({
  type: z.literal('DELIVERY'),
  useOptions: z.boolean(),
  delivery: z.object({
    deliveryFeeType: z.string(),
    deliveryFee: z.number(),
    freeDeliveryMinAmount: z.number(),
    returnDeliveryFee: z.number(),
    exchangeDeliveryFee: z.number(),
    remoteAreaExtraFee: z.number(),
    jejuExtraFee: z.number(),
    isJejuRestricted: z.boolean(),
    isRemoteIslandRestricted: z.boolean(),
  }),
  exchangeReturnInfo: z.string(),
  productInfoNotice: z.string(),
});

// ETicket 상세 스키마
const eticketTemplateDetailSchema = baseProductTemplateDetailSchema.extend({
  type: z.literal('E-TICKET'),
  useOptions: z.boolean(),
});

// Discriminated Union 스키마
export const productTemplateDetailSchema = z.discriminatedUnion('type', [
  hotelTemplateDetailSchema,
  deliveryTemplateDetailSchema,
  eticketTemplateDetailSchema,
]);

// ========================================
// Update Input 스키마
// ========================================

// Hotel 수정 스키마 (id 추가, type은 변경 불가)
export const updateHotelTemplateInputSchema = createHotelTemplateInputSchema
  .omit({ type: true })
  .extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  });

// Delivery 수정 스키마 (id 추가, type은 변경 불가)
export const updateDeliveryTemplateInputSchema =
  createDeliveryTemplateInputSchema.omit({ type: true }).extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  });

// ETicket 수정 스키마 (id 추가, type은 변경 불가)
export const updateETicketTemplateInputSchema = createETicketTemplateInputSchema
  .omit({ type: true })
  .extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  });

// ========================================
// Update Response 스키마
// ========================================

export const updateProductTemplateResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  message: z.string(),
});

// ========================================
// Delete Response 스키마
// ========================================

export const deleteProductTemplateResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
});
