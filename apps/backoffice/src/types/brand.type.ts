import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@yestravelkr/api-types';
import { z } from 'zod';

// Infer types from the TRPC router
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Export brand-related types from TRPC router
export type Brand = RouterOutputs['backofficeBrand']['findById'];
export type RegisterBrandInput = RouterInputs['backofficeBrand']['register'];
export type FindBrandByIdInput = RouterInputs['backofficeBrand']['findById'];
export type UpdateBrandInput = RouterInputs['backofficeBrand']['update'];

// Business type enum for form options
export enum BusinessType {
  CORPORATION = 'CORPORATION', // 법인 사업자
  SOLE_PROPRIETOR = 'SOLE_PROPRIETOR', // 간이 사업자
  INDIVIDUAL = 'INDIVIDUAL', // 개인 사업자
}

// Validation schema for forms
export const registerBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  businessInfo: z
    .object({
      type: z.enum(['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL']).nullish(),
      name: z.string().nullish(),
      licenseNumber: z.string().nullish(),
      ceoName: z.string().nullish(),
    })
    .nullish(),
  bankInfo: z
    .object({
      name: z.string().nullish(),
      accountNumber: z.string().nullish(),
      accountHolder: z.string().nullish(),
    })
    .nullish(),
});
