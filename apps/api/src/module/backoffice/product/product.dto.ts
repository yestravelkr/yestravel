import { z } from 'zod';
import {
  createProductInputSchema,
  updateProductInputSchema,
  productDetailSchema,
  hotelOptionInputSchema,
} from './product.schema';

// HotelOption Input DTO
export type HotelOptionInputDto = z.infer<typeof hotelOptionInputSchema>;

// Create Input DTO
export type CreateProductInputDto = z.infer<typeof createProductInputSchema>;

// Update Input DTO
export type UpdateProductInputDto = z.infer<typeof updateProductInputSchema>;

// Response DTOs
export interface CreateProductResponse {
  id: number;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name: string;
  message: string;
}

export interface UpdateProductResponse {
  id: number;
  name: string;
  message: string;
}

export interface DeleteProductResponse {
  id: number;
  message: string;
}

// Detail Response
export type ProductDetail = z.infer<typeof productDetailSchema>;

// List Response
export interface ProductListItem {
  id: number;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name: string;
  brand: {
    id: number;
    name: string;
  };
  thumbnail: string | null;
  price: number;
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  useStock: boolean;
  useCalendar: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  data: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query DTO
export interface FindAllProductQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  type?: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name?: string;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  brandIds?: number[];
  ids?: number[];
  startDate?: string;
  endDate?: string;
  dateFilterType?: 'CREATED_AT' | 'UPDATED_AT';
}
