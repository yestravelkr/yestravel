import { z } from 'zod';

// Enum for BusinessType
export enum BusinessType {
  CORPORATION = 'CORPORATION', // 법인 사업자
  SOLE_PROPRIETOR = 'SOLE_PROPRIETOR', // 간이 사업자
  INDIVIDUAL = 'INDIVIDUAL', // 개인 사업자
}

// Base schemas for nested objects
export const businessInfoSchema = z.object({
  type: z.nativeEnum(BusinessType).nullish(),
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