import { z } from 'zod';
import { EnumType } from '@src/types/utility.type';
import { roleEnumSchema } from '@src/module/backoffice/admin/admin.schema';

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

// Brand manager schema (브랜드 관리자 정보)
export const brandManagerSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
  createdAt: z.date(),
});

// Main brand schema
export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  businessInfo: businessInfoSchema.nullish(),
  bankInfo: bankInfoSchema.nullish(),
  brandManagers: z.array(brandManagerSchema).optional(),
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

// Brand manager CRUD schemas
export const createBrandManagerInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  name: z.string().min(1, '이름은 필수입니다.'),
  phoneNumber: z.string().min(1, '전화번호는 필수입니다.'),
  brandId: z.number(),
  role: roleEnumSchema.optional(),
});

export const deleteBrandManagerInputSchema = z.object({
  id: z.number(),
  brandId: z.number(),
});

export const findBrandManagerByIdInputSchema = z.object({
  id: z.number(),
});

export const brandManagerProfileSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.string(),
  partnerType: z.literal('BRAND'),
  partnerId: z.number(),
});

export const createBrandManagerOutputSchema = z.object({
  id: z.number(),
  email: z.string(),
});

export const findBrandManagersInputSchema = z.object({
  brandId: z.number(),
});

export const brandManagerListSchema = z.array(brandManagerSchema);
