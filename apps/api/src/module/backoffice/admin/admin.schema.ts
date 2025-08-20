import { z } from 'zod';

// Common role enum for all schemas
export const ROLE_ENUM = ['ADMIN_SUPER', 'ADMIN_STAFF', 'PARTNER_SUPER', 'PARTNER_STAFF'] as const;
export const roleEnum = z.enum(ROLE_ENUM);

// Role type for use in entities
export type RoleType = typeof ROLE_ENUM[number];

// Common product type enum for all schemas
export const PRODUCT_TYPE_ENUM = ['HOTEL', 'E-TICKET', 'DELIVERY'] as const;
export const productTypeEnum = z.enum(PRODUCT_TYPE_ENUM);

// Product type for use in entities
export type ProductType = typeof PRODUCT_TYPE_ENUM[number];

// Common business type enum for all schemas
export const BUSINESS_TYPE_ENUM = ['CORPORATION', 'SOLE_PROPRIETOR', 'INDIVIDUAL'] as const;
export const businessTypeEnum = z.enum(BUSINESS_TYPE_ENUM);

// Business type for use in entities
export type BusinessType = typeof BUSINESS_TYPE_ENUM[number];

// Admin list response schema
export const adminListItemSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: roleEnum,
});

export const adminListSchema = z.array(adminListItemSchema);

// Admin detail response schema
export const adminDetailSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnum,
  createdAt: z.date(),
});

// Admin findById input schema
export const findAdminByIdInputSchema = z.object({
  id: z.number(),
});

// Admin update input schema
export const updateAdminInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '이름은 필수입니다'),
  phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
  role: roleEnum,
});

// Admin update password input schema
export const updateAdminPasswordInputSchema = z.object({
  id: z.number(),
  newPassword: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

// Admin update password response schema
export const updateAdminPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Admin create input schema
export const createAdminInputSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름은 필수입니다'),
  phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
  role: roleEnum,
});