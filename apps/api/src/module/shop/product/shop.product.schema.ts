import { z } from 'zod';
import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

/**
 * Shop 상품 상세 스키마
 *
 * 상품 타입별로 다른 옵션 구조를 가짐:
 * - HOTEL: skus, hotelOptions
 * - E-TICKET: ticketOptions (추후 구현)
 * - DELIVERY: deliveryOptions (추후 구현)
 */

// 호텔 옵션 스키마
const hotelOptionsSchema = z.object({
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
});

// E-TICKET 옵션 스키마 (추후 확장)
const eTicketOptionsSchema = z.object({
  ticketOptions: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
});

// DELIVERY 옵션 스키마 (추후 확장)
const deliveryOptionsSchema = z.object({
  deliveryOptions: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
});

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

  // 호텔 전용 정보 (HOTEL 타입일 때만 값이 있음)
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

  // 인플루언서 정보 (shopInfluencerSchema와 동일한 필드명 사용)
  influencer: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string().nullish(),
    thumbnail: z.string().nullish(),
  }),

  // 타입별 옵션 (해당 타입의 옵션만 값이 있음)
  options: z.object({
    // HOTEL 타입
    skus: z.array(
      z.object({
        id: z.number(),
        quantity: z.number(),
        date: z.string(),
      })
    ),
    hotelOptions: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        priceByDate: z.record(z.number()),
      })
    ),

    // E-TICKET 타입 (추후 구현)
    ticketOptions: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
        })
      )
      .optional(),

    // DELIVERY 타입 (추후 구현)
    deliveryOptions: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number(),
        })
      )
      .optional(),
  }),
});
