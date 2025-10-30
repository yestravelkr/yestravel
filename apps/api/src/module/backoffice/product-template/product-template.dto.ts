import type { PaginationQuery } from '@src/module/shared/schema/pagination.schema';

// ========================================
// FindAll DTO
// ========================================

export interface FindAllProductTemplateQuery extends PaginationQuery {
  type?: string;
  name?: string;
  dateFilterType?: string;
  startDate?: string;
  endDate?: string;
  useStock?: boolean;
  isIntegrated?: boolean;
  brandIds?: number[];
  categoryIds?: number[];
}

export interface ProductTemplateListItem {
  id: number;
  type: string;
  name: string;
  brand: {
    id: number;
    name: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
  isIntegrated: boolean;
  useStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductTemplateListResponse {
  data: ProductTemplateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// Create DTO
// ========================================

export interface CreateProductTemplateInput {
  type: 'HOTEL' | 'DELIVERY' | 'E-TICKET';
  name: string;
  brandId: number;
  categoryIds?: number[];
  thumbnailUrls?: string[];
  description?: string;
  detailContent?: string;
  useStock?: boolean;
  // Hotel 전용
  baseCapacity?: number;
  maxCapacity?: number;
  checkInTime?: string;
  checkOutTime?: string;
  bedTypes?: string[];
  tags?: string[];
  // Delivery 전용
  useOptions?: boolean;
  delivery?: any;
  exchangeReturnInfo?: string;
  productInfoNotice?: string;
}

export interface CreateProductTemplateResponse {
  id: number;
  type: string;
  name: string;
  message: string;
}

// ========================================
// FindById DTO
// ========================================

// 공통 필드
interface BaseProductTemplateDetail {
  id: number;
  name: string;
  brandId: number;
  brand: {
    id: number;
    name: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
  thumbnailUrls: string[];
  description: string;
  detailContent: string;
  useStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Hotel 타입 상세
export interface HotelTemplateDetail extends BaseProductTemplateDetail {
  type: 'HOTEL';
  baseCapacity: number;
  maxCapacity: number;
  checkInTime: string;
  checkOutTime: string;
  bedTypes: string[];
  tags: string[];
}

// Delivery 타입 상세
export interface DeliveryTemplateDetail extends BaseProductTemplateDetail {
  type: 'DELIVERY';
  useOptions: boolean;
  delivery: {
    deliveryFeeType: string;
    deliveryFee: number;
    freeDeliveryMinAmount: number;
    returnDeliveryFee: number;
    exchangeDeliveryFee: number;
    remoteAreaExtraFee: number;
    jejuExtraFee: number;
    isJejuRestricted: boolean;
    isRemoteIslandRestricted: boolean;
  };
  exchangeReturnInfo: string;
  productInfoNotice: string;
}

// E-Ticket 타입 상세
export interface ETicketTemplateDetail extends BaseProductTemplateDetail {
  type: 'E-TICKET';
  useOptions: boolean;
}

// Union 타입
export type ProductTemplateDetail =
  | HotelTemplateDetail
  | DeliveryTemplateDetail
  | ETicketTemplateDetail;
