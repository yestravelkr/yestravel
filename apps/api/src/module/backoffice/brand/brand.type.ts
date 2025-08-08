import { z } from 'zod';
import {
  businessInfoSchema,
  bankInfoSchema,
  brandSchema,
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  updateBrandInputSchema,
} from './brand.schema';

// Inferred types from Zod schemas
export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type BankInfo = z.infer<typeof bankInfoSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type RegisterBrandInput = z.infer<typeof registerBrandInputSchema>;
export type FindBrandByIdInput = z.infer<typeof findBrandByIdInputSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;