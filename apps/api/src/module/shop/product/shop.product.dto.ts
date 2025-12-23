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
