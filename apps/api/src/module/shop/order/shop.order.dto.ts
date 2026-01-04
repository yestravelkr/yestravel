import type { z } from 'zod';
import type {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
} from './shop.order.schema';

export type CreateHotelOrderInput = z.infer<typeof createHotelOrderInputSchema>;
export type CreateHotelOrderOutput = z.infer<typeof createHotelOrderOutputSchema>;
