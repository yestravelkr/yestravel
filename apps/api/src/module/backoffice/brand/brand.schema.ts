import { z } from 'zod';
import { EnumType } from '@src/types/utility.type';

// Common business type enum for all schemas
export const BUSINESS_TYPE_ENUM_VALUE = [
  'CORPORATION',
  'SOLE_PROPRIETOR',
  'INDIVIDUAL',
] as const;
// Business type for use in entities
export type BusinessTypeEnumType = (typeof BUSINESS_TYPE_ENUM_VALUE)[number];
export const BusinessTypeEnum: EnumType<BusinessTypeEnumType> = {
  CORPORATION: 'CORPORATION',
  SOLE_PROPRIETOR: 'SOLE_PROPRIETOR',
  INDIVIDUAL: 'INDIVIDUAL',
};
export const businessTypeEnumSchema = z.enum(BUSINESS_TYPE_ENUM_VALUE);

// Base schemas for nested objects
export const businessInfoSchema = z.object({
  type: businessTypeEnumSchema.nullish(),
  name: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  ceoName: z.string().nullish(),
  licenseFileUrl: z.string().nullish(),
});

export const bankInfoSchema = z.object({
  name: z.string().nullish(),
  accountNumber: z.string().nullish(),
  accountHolder: z.string().nullish(),
});

// Main brand schema
export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  businessInfo: businessInfoSchema.nullish(),
  bankInfo: bankInfoSchema.nullish(),
  createdAt: z.date(),
});

// Input schemas
export const registerBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  businessInfo: businessInfoSchema.nullish(),
  bankInfo: bankInfoSchema.nullish(),
});

export const findBrandByIdInputSchema = z.object({
  id: z.number(),
});

export const updateBrandInputSchema = registerBrandInputSchema.extend({
  id: z.number(),
});

export const deleteBrandInputSchema = z.object({
  id: z.number(),
});
