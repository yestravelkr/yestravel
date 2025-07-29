import { z } from 'zod';
import { BusinessType } from '@src/module/backoffice/domain/social-media-platform.enum';

// Base schemas for nested objects
export const businessInfoSchema = z.object({
  type: z.nativeEnum(BusinessType).optional().nullable(),
  name: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  ceoName: z.string().optional().nullable(),
});

export const bankInfoSchema = z.object({
  name: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  accountHolder: z.string().optional().nullable(),
});

// Main brand schema
export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  businessInfo: businessInfoSchema.optional().nullable(),
  bankInfo: bankInfoSchema.optional().nullable(),
  createdAt: z.date(),
});

// Input schemas
export const registerBrandInputSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  businessInfo: businessInfoSchema.optional(),
  bankInfo: bankInfoSchema.optional(),
});

export const findBrandByIdInputSchema = z.object({
  id: z.number(),
});


