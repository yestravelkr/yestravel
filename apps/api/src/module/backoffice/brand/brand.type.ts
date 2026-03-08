import { z } from 'zod';
import {
  businessInfoSchema,
  bankInfoSchema,
  brandSchema,
  registerBrandInputSchema,
  findBrandByIdInputSchema,
  updateBrandInputSchema,
  deleteBrandInputSchema,
  createBrandManagerInputSchema,
  createBrandManagerOutputSchema,
  findBrandManagersInputSchema,
  deleteBrandManagerInputSchema,
  findBrandManagerByIdInputSchema,
  brandManagerProfileSchema,
} from './brand.schema';

// Inferred types from Zod schemas
export type BusinessInfo = z.infer<typeof businessInfoSchema>;
export type BankInfo = z.infer<typeof bankInfoSchema>;
export type Brand = z.infer<typeof brandSchema>;
export type RegisterBrandInput = z.infer<typeof registerBrandInputSchema>;
export type FindBrandByIdInput = z.infer<typeof findBrandByIdInputSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;
export type DeleteBrandInput = z.infer<typeof deleteBrandInputSchema>;
export type CreateBrandManagerInput = z.infer<
  typeof createBrandManagerInputSchema
>;
export type CreateBrandManagerOutput = z.infer<
  typeof createBrandManagerOutputSchema
>;
export type FindBrandManagersInput = z.infer<
  typeof findBrandManagersInputSchema
>;
export type DeleteBrandManagerInput = z.infer<
  typeof deleteBrandManagerInputSchema
>;
export type FindBrandManagerByIdInput = z.infer<
  typeof findBrandManagerByIdInputSchema
>;
export type BrandManagerProfile = z.infer<typeof brandManagerProfileSchema>;
