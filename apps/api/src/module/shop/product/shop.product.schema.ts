import { z } from 'zod';
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

/**
 * Shop 상품 상세 스키마
 *
 * FE HotelProductComponent에서 필요한 데이터 구조:
 * - 상품 정보: name, thumbnailUrl, originalPrice, price
 * - 인플루언서: avatarUrl, name, handle(slug)
 * - 캠페인: id, title, startAt, endAt
 * - 상세 콘텐츠: detailHtml
 * - 옵션: skus, hotelOptions (HotelOptionSelectorConfig)
 */
export const shopProductDetailSchema = z.object({
  id: z.number(),
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),

  // 상품 정보
  name: z.string(),
  thumbnailUrl: z.string().nullish(),
  originalPrice: z.number(),
  price: z.number(),
  description: z.string().nullish(),
  detailHtml: z.string().nullish(),

  // 호텔 전용 정보
  baseCapacity: z.number().nullish(),
  maxCapacity: z.number().nullish(),
  checkInTime: z.string().nullish(),
  checkOutTime: z.string().nullish(),

  // 캠페인 정보
  campaign: z.object({
    id: z.number(),
    title: z.string(),
    startAt: z.date(),
    endAt: z.date(),
  }),

  // 브랜드 정보
  brand: z.object({
    id: z.number(),
    name: z.string(),
  }),

  // 인플루언서 정보
  influencer: z.object({
    id: z.number(),
    name: z.string(),
    avatarUrl: z.string().nullish(),
    handle: z.string().nullish(), // slug
  }),

  // Hotel 타입 상품의 옵션 구조 (HotelOptionSelectorConfig)
  options: z.object({
    // 날짜별 SKU 재고 정보
    skus: z.array(
      z.object({
        id: z.number(),
        quantity: z.number(),
        date: z.string(), // YYYY-MM-DD 형식
      })
    ),

    // 선택 가능한 호텔 옵션 목록 (1개 필수 선택)
    hotelOptions: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        priceByDate: z.record(z.number()), // { "2025-11-21": 100000, ... }
      })
    ),
  }),
});
