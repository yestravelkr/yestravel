import type { z } from 'zod';
import type {
  createHotelOrderInputSchema,
  createHotelOrderOutputSchema,
  getTmpOrderInputSchema,
  getTmpOrderOutputSchema,
  updateTmpOrderInputSchema,
  updateTmpOrderOutputSchema,
  getOrderDetailInputSchema,
  getOrderDetailOutputSchema,
  getMyOrdersInputSchema,
  getMyOrdersOutputSchema,
} from './shop.order.schema';

export type CreateHotelOrderInput = z.infer<typeof createHotelOrderInputSchema>;
export type CreateHotelOrderOutput = z.infer<
  typeof createHotelOrderOutputSchema
>;

export type GetTmpOrderInput = z.infer<typeof getTmpOrderInputSchema>;
export type GetTmpOrderOutput = z.infer<typeof getTmpOrderOutputSchema>;

export type UpdateTmpOrderInput = z.infer<typeof updateTmpOrderInputSchema>;
export type UpdateTmpOrderOutput = z.infer<typeof updateTmpOrderOutputSchema>;

export type GetOrderDetailInput = z.infer<typeof getOrderDetailInputSchema>;
export type GetOrderDetailOutput = z.infer<typeof getOrderDetailOutputSchema>;

export type GetMyOrdersInput = z.infer<typeof getMyOrdersInputSchema>;
export type GetMyOrdersOutput = z.infer<typeof getMyOrdersOutputSchema>;
