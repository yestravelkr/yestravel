import { z } from 'zod';
import {
  shopPaymentCompleteInputSchema,
  shopPaymentCompleteOutputSchema,
} from './shop.payment.schema';

export type ShopPaymentCompleteInput = z.infer<
  typeof shopPaymentCompleteInputSchema
>;
export type ShopPaymentCompleteOutput = z.infer<
  typeof shopPaymentCompleteOutputSchema
>;
