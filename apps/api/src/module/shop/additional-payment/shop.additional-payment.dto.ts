import type { z } from 'zod';
import type {
  shopAdditionalPaymentGetByTokenInputSchema,
  shopAdditionalPaymentGetByTokenOutputSchema,
  shopAdditionalPaymentCompleteInputSchema,
  shopAdditionalPaymentCompleteOutputSchema,
} from './shop.additional-payment.schema';

export type ShopAdditionalPaymentGetByTokenInput = z.infer<
  typeof shopAdditionalPaymentGetByTokenInputSchema
>;
export type ShopAdditionalPaymentGetByTokenOutput = z.infer<
  typeof shopAdditionalPaymentGetByTokenOutputSchema
>;

export type ShopAdditionalPaymentCompleteInput = z.infer<
  typeof shopAdditionalPaymentCompleteInputSchema
>;
export type ShopAdditionalPaymentCompleteOutput = z.infer<
  typeof shopAdditionalPaymentCompleteOutputSchema
>;
