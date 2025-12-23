import type { z } from 'zod';
import type { shopProductDetailSchema } from './shop.product.schema';

/**
 * 상품 상세 응답 (Zod 스키마에서 추론)
 */
export type ProductDetailResponse = z.infer<typeof shopProductDetailSchema>;

/**
 * 상품 상세 조회 입력
 */
export interface GetProductDetailInput {
  saleId: number;
}

/**
 * 호텔 상품 추가 정보
 */
export interface HotelProductDetails {
  baseCapacity: number | null;
  maxCapacity: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  hotelOptions: Array<{
    id: number;
    name: string;
    priceByDate: Record<string, number>;
  }>;
  skus: Array<{
    id: number;
    quantity: number;
    date: string;
  }>;
}
