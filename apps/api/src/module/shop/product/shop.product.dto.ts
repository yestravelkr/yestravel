import type { z } from 'zod';
import type {
  shopProductDetailSchema,
  campaignOtherProductsSchema,
} from './shop.product.schema';

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
  bedTypes: string[];
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

/**
 * 판매자 정보
 */
export interface SellerInfo {
  companyName: string | null;
  ceoName: string | null;
  address: string | null;
  licenseNumber: string | null;
  mailOrderLicenseNumber: string | null;
}

/**
 * 숙박 정보 (HOTEL 타입)
 */
export interface AccommodationInfo {
  checkInTime: string | null;
  checkOutTime: string | null;
  baseCapacity: number | null;
  maxCapacity: number | null;
  bedTypes: string[] | null;
}

/**
 * 호텔 판매정보
 */
export interface HotelSalesInfo {
  seller: SellerInfo;
  accommodationInfo: AccommodationInfo;
}

/**
 * 기본 판매정보 (E-TICKET, DELIVERY 등)
 */
export interface BaseSalesInfo {
  seller: SellerInfo;
  // TODO: DELIVERY 타입 추가 예정
  // deliveryInfo: DeliveryInfo;
  // exchangeReturnInfo: ExchangeReturnInfo;
  // productInfoNotice: string | null;
}

/**
 * 캠페인 다른 상품 조회 입력
 */
export interface GetCampaignOtherProductsInput {
  saleId: number;
}

/**
 * 캠페인 다른 상품 응답 (Zod 스키마에서 추론)
 */
export type CampaignOtherProductsResponse = z.infer<
  typeof campaignOtherProductsSchema
>;
