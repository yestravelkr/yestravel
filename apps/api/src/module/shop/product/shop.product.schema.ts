import { z } from 'zod';
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

export const shopProductDetailSchema = z.object({
  id: z.number(),
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  thumbnailUrl: z.string().nullish(),
  name: z.string(),
  description: z.string().nullish(),
  detailContent: z.string().nullish(),

  campaign: z.object({
    id: z.number(),
    title: z.string(),
    startAt: z.date(),
    endAt: z.date(),
  }),

  brand: z.object({
    id: z.number(),
    name: z.string(),
  }),

  influencer: z.object({
    id: z.number(),
    name: z.string(),
  }),

  // Hotel 타입 상품의 옵션 구조
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
