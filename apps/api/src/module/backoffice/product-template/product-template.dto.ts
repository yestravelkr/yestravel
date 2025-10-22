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
