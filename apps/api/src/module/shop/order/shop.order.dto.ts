import type { z } from 'zod';
import type {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
  getTmpOrderInputSchema,
  getTmpOrderOutputSchema,
} from './shop.order.schema';

export type CreateHotelOrderInput = z.infer<typeof createHotelOrderInputSchema>;
export type CreateHotelOrderOutput = z.infer<typeof createHotelOrderOutputSchema>;

export type GetTmpOrderInput = z.infer<typeof getTmpOrderInputSchema>;
export type GetTmpOrderOutput = z.infer<typeof getTmpOrderOutputSchema>;
