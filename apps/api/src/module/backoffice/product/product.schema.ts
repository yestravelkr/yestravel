import { z } from 'zod';
import {
  normalizeTime,
  TIME_FORMAT_REGEX,
  TIME_FORMAT_ERROR_MESSAGE_KO,
} from '@src/utils/time.util';

// HotelOption Input 스키마
export const hotelOptionInputSchema = z.object({
  id: z.number().int().positive().nullish(), // 기존 옵션 수정 시 사용
  name: z.string().min(1, '옵션명은 필수입니다'),
  priceByDate: z.record(z.string(), z.number().int().nonnegative()).default({}),
  anotherPriceByDate: z
    .record(
      z.string(),
      z.object({
        supplyPrice: z.number().int().nonnegative(),
        commission: z.number().int().nonnegative(),
      })
    )
    .default({}),
});

// HotelSku Input 스키마
export const hotelSkuInputSchema = z.object({
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다'),
  quantity: z.number().int().min(0, '재고는 0 이상이어야 합니다'),
});

// DeliveryPolicy 스키마
const deliveryPolicySchema = z.object({
  deliveryFeeType: z.enum(['FREE', 'PAID', 'CONDITIONAL_FREE']),
  deliveryFee: z.number().int().nonnegative().default(0),
  freeDeliveryMinAmount: z.number().int().nonnegative().default(0),
  returnDeliveryFee: z.number().int().nonnegative().default(0),
  exchangeDeliveryFee: z.number().int().nonnegative().default(0),
  remoteAreaExtraFee: z.number().int().nonnegative().default(0),
  jejuExtraFee: z.number().int().nonnegative().default(0),
  isJejuRestricted: z.boolean().default(false),
  isRemoteIslandRestricted: z.boolean().default(false),
});

// Base Product Input Schema (공통 필드)
const baseProductInputSchema = z.object({
  name: z.string().min(1, '상품명은 필수입니다'),
  brandId: z.number().int().positive('브랜드를 선택해주세요'),
  productTemplateId: z.number().int().positive().nullish(),
  campaignId: z.number().int().positive().nullish(),
  categoryIds: z.array(z.number().int().positive()).default([]),
  thumbnailUrls: z.array(z.string().url()).default([]),
  description: z.string().default(''),
  detailContent: z.string().default(''),
  useCalendar: z.boolean(),
  useStock: z.boolean().default(false),
  useOptions: z.boolean().default(false),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다'),
  status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']).default('VISIBLE'),
  displayOrder: z.number().int().nullish(),
});

// Hotel Product Input Schema
const hotelProductInputSchema = baseProductInputSchema.extend({
  type: z.literal('HOTEL'),
  useCalendar: z.literal(true),
  baseCapacity: z.number().int().positive('기준인원은 1명 이상이어야 합니다'),
  maxCapacity: z.number().int().positive('최대인원은 1명 이상이어야 합니다'),
  checkInTime: z
    .string()
    .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
    .transform(normalizeTime),
  checkOutTime: z
    .string()
    .regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR_MESSAGE_KO)
    .transform(normalizeTime),
  bedTypes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  hotelOptions: z.array(hotelOptionInputSchema).default([]),
  hotelSkus: z.array(hotelSkuInputSchema).default([]),
});

// Delivery Product Input Schema
const deliveryProductInputSchema = baseProductInputSchema.extend({
  type: z.literal('DELIVERY'),
  delivery: deliveryPolicySchema,
  exchangeReturnInfo: z.string().default(''),
  productInfoNotice: z.string().default(''),
});

// ETicket Product Input Schema
const eticketProductInputSchema = baseProductInputSchema.extend({
  type: z.literal('E-TICKET'),
});

// Create Product Input Schema (discriminated union)
export const createProductInputSchema = z.discriminatedUnion('type', [
  hotelProductInputSchema,
  deliveryProductInputSchema,
  eticketProductInputSchema,
]);

// Update Product Input Schema (discriminated union with id)
export const updateProductInputSchema = z.discriminatedUnion('type', [
  hotelProductInputSchema.extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  }),
  deliveryProductInputSchema.extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  }),
  eticketProductInputSchema.extend({
    id: z.number().int().positive('유효한 ID를 입력해주세요'),
  }),
]);

// Response schemas
export const createProductResponseSchema = z.object({
  id: z.number(),
  type: z.enum(['HOTEL', 'E-TICKET', 'DELIVERY']),
  name: z.string(),
  message: z.string(),
});

export const updateProductResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  message: z.string(),
});

export const deleteProductResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
});

// Product Detail Schemas
// 호텔 옵션 응답 스키마
const hotelOptionResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  priceByDate: z.record(z.string(), z.number()),
  anotherPriceByDate: z.record(
    z.string(),
    z.object({
      supplyPrice: z.number(),
      commission: z.number(),
    })
  ),
});

const hotelProductSchema = z.object({
  type: z.literal('HOTEL'),
  id: z.number(),
  name: z.string(),
  brandId: z.number(),
  brandName: z.string(),
  productTemplateId: z.number().nullish(),
  campaignId: z.number().nullish(),
  thumbnailUrls: z.array(z.string()),
  description: z.string(),
  detailContent: z.string(),
  useCalendar: z.boolean(),
  useStock: z.boolean(),
  useOptions: z.boolean(),
  price: z.number(),
  status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
  displayOrder: z.number().nullish(),
  baseCapacity: z.number(),
  maxCapacity: z.number(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  bedTypes: z.array(z.string()),
  tags: z.array(z.string()),
  hotelOptions: z.array(hotelOptionResponseSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const deliveryProductSchema = z.object({
  type: z.literal('DELIVERY'),
  id: z.number(),
  name: z.string(),
  brandId: z.number(),
  brandName: z.string(),
  productTemplateId: z.number().nullish(),
  campaignId: z.number().nullish(),
  thumbnailUrls: z.array(z.string()),
  description: z.string(),
  detailContent: z.string(),
  useCalendar: z.boolean(),
  useStock: z.boolean(),
  useOptions: z.boolean(),
  price: z.number(),
  status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
  displayOrder: z.number().nullish(),
  delivery: deliveryPolicySchema,
  exchangeReturnInfo: z.string(),
  productInfoNotice: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const eticketProductSchema = z.object({
  type: z.literal('E-TICKET'),
  id: z.number(),
  name: z.string(),
  brandId: z.number(),
  brandName: z.string(),
  productTemplateId: z.number().nullish(),
  campaignId: z.number().nullish(),
  thumbnailUrls: z.array(z.string()),
  description: z.string(),
  detailContent: z.string(),
  useCalendar: z.boolean(),
  useStock: z.boolean(),
  useOptions: z.boolean(),
  price: z.number(),
  status: z.enum(['VISIBLE', 'HIDDEN', 'SOLD_OUT']),
  displayOrder: z.number().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productDetailSchema = z.discriminatedUnion('type', [
  hotelProductSchema,
  deliveryProductSchema,
  eticketProductSchema,
]);
