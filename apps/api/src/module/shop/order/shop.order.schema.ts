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
