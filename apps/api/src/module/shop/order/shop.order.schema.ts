import { z } from 'zod';

import { PRODUCT_TYPE_ENUM_VALUE } from '@src/module/backoffice/admin/admin.schema';

export const createHotelOrderInputSchema = z.object({
  saleId: z.number(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  optionId: z.number(),
});

export const createHotelOrderOutputSchema = z.object({
  orderNumber: z.string(),
});

// getTmpOrder
export const getTmpOrderInputSchema = z.object({
  orderNumber: z.string(),
});

const hotelOrderOptionDataSchema = z.object({
  type: z.literal('HOTEL'),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  hotelOptionId: z.number(),
  hotelOptionName: z.string(),
  priceByDate: z.record(z.string(), z.number()),
});

export const getTmpOrderOutputSchema = z.object({
  type: z.enum(PRODUCT_TYPE_ENUM_VALUE),
  totalAmount: z.number(),
  product: z.object({
    name: z.string(),
    thumbnailUrl: z.string().nullish(),
    checkInTime: z.string(),
    checkOutTime: z.string(),
  }),
  orderOptionSnapshot: hotelOrderOptionDataSchema,
});

// updateTmpOrder - 임시 주문 정보 업데이트
export const updateTmpOrderInputSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
});

export const updateTmpOrderOutputSchema = z.object({
  success: z.boolean(),
  customerName: z.string(),
  customerPhone: z.string(),
});

// getOrderDetail - 실제 주문 상세 조회
export const getOrderDetailInputSchema = z.object({
  orderNumber: z.string(),
});

export const getOrderDetailOutputSchema = z.object({
  type: z.literal('accommodation'),
  orderId: z.number(),
  orderNumber: z.string(),
  orderDate: z.string(),
  status: z.string(),
  statusDescription: z.string().nullish(),
  influencerSlug: z.string().nullish(),
  accommodation: z.object({
    thumbnail: z.string().nullish(),
    hotelName: z.string(),
    roomName: z.string(),
    optionName: z.string(),
  }),
  checkIn: z.object({
    date: z.string(),
    time: z.string(),
  }),
  checkOut: z.object({
    date: z.string(),
    time: z.string(),
  }),
  user: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  payment: z.object({
    totalAmount: z.number(),
    productAmount: z.number(),
    paymentMethod: z.string(),
  }),
});
