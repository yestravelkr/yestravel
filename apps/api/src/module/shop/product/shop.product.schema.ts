import { z } from 'zod';

/**
 * Shop 상품 상세 스키마
 *
 * 상품 타입별로 다른 옵션 구조를 가짐:
 * - HOTEL: skus, hotelOptions
 * - E-TICKET: ticketOptions (추후 구현)
 * - DELIVERY: deliveryOptions (추후 구현)
 */

// 판매자 정보 스키마 (공통)
const sellerInfoSchema = z.object({
  companyName: z.string().nullish(), // 업체명
  ceoName: z.string().nullish(), // 대표자명
  address: z.string().nullish(), // 사업장 주소
  licenseNumber: z.string().nullish(), // 사업자등록번호
  mailOrderLicenseNumber: z.string().nullish(), // 통신판매업 신고번호
});

// 숙박 정보 스키마 (HOTEL 타입)
const accommodationInfoSchema = z.object({
  checkInTime: z.string().nullish(), // 입실시간
  checkOutTime: z.string().nullish(), // 퇴실시간
  baseCapacity: z.number().nullish(), // 기준인원
  maxCapacity: z.number().nullish(), // 최대인원
  bedTypes: z.array(z.string()).nullish(), // 침대구성
});

// TODO: 배송 상품 salesInfo 스키마 (추후 구현)
// const deliveryInfoSchema = z.object({
//   deliveryMethod: z.string().nullish(), // 배송방법
//   deliveryFee: z.string().nullish(), // 배송비 정보
// });
// const exchangeReturnInfoSchema = z.object({
//   exchangeReturnInfo: z.string().nullish(), // 교환/반품 정보
// });

// 판매정보 스키마 - HOTEL 타입
const hotelSalesInfoSchema = z.object({
  seller: sellerInfoSchema,
  accommodationInfo: accommodationInfoSchema,
});

// TODO: 판매정보 스키마 - DELIVERY 타입 (추후 구현)
// const deliverySalesInfoSchema = z.object({
//   seller: sellerInfoSchema,
//   deliveryInfo: deliveryInfoSchema,
//   exchangeReturnInfo: exchangeReturnInfoSchema,
//   productInfoNotice: z.string().nullish(),
// });

// 판매정보 스키마 - 기본 (E-TICKET 등)
const baseSalesInfoSchema = z.object({
  seller: sellerInfoSchema,
});

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

// 공통 필드 스키마
const baseProductSchema = z.object({
  id: z.number(),

  // 상품 정보
  name: z.string(),
  thumbnailUrl: z.string().nullish(),
  originalPrice: z.number(),
  price: z.number(),
  description: z.string().nullish(),
  detailHtml: z.string().nullish(),

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
    slug: z.string().nullish(),
    thumbnail: z.string().nullish(),
  }),
});

// HOTEL 타입 상품 상세 스키마
const hotelProductDetailSchema = baseProductSchema.extend({
  type: z.literal('HOTEL'),

  // 호텔 전용 정보
  baseCapacity: z.number(),
  maxCapacity: z.number(),
  checkInTime: z.string(),
  checkOutTime: z.string(),

  // 호텔 옵션
  options: z.object({
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
  }),

  // 호텔 판매정보
  salesInfo: hotelSalesInfoSchema,
});

// TODO: DELIVERY 타입 상품 상세 스키마 (추후 구현)
const deliveryProductDetailSchema = baseProductSchema.extend({
  type: z.literal('DELIVERY'),

  options: z.object({
    // TODO: 배송 상품 옵션 추가
  }),

  // TODO: 배송 판매정보 추가 (deliveryInfo, exchangeReturnInfo, productInfoNotice)
  salesInfo: baseSalesInfoSchema,
});

// TODO: E-TICKET 타입 상품 상세 스키마 (추후 구현)
const eTicketProductDetailSchema = baseProductSchema.extend({
  type: z.literal('E-TICKET'),

  options: z.object({
    // TODO: E-TICKET 상품 옵션 추가
  }),

  salesInfo: baseSalesInfoSchema,
});

// Discriminated Union으로 타입별 스키마 통합
export const shopProductDetailSchema = z.discriminatedUnion('type', [
  hotelProductDetailSchema,
  deliveryProductDetailSchema,
  eTicketProductDetailSchema,
]);
