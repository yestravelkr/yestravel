import { z } from 'zod';

// Common business type enum for all schemas
const BUSINESS_TYPE_ENUM = ['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const;
const businessTypeEnum = z.enum(BUSINESS_TYPE_ENUM);

// Base schemas for nested objects
export const businessInfoSchema = z.object({
  type: businessTypeEnum.nullish(),
  name: z.string().nullish(),
  licenseNumber: z.string().nullish(),
  ceoName: z.string().nullish(),
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