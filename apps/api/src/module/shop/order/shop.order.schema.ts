import { z } from 'zod';

export const createHotelOrderInputSchema = z.object({
  saleId: z.number(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  optionId: z.number(),
});

export const createHotelOrderOutputSchema = z.object({
  orderId: z.number(),
});
