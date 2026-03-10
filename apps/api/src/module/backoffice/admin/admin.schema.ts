import { z } from 'zod';
import { EnumType } from '@src/types/utility.type';

// Common role enum for all schemas
export const ROLE_ENUM_VALUE = [
  'ADMIN_SUPER',
  'ADMIN_STAFF',
  'PARTNER_SUPER',
  'PARTNER_STAFF',
] as const;
// Role type for use in entities
export type RoleEnumType = (typeof ROLE_ENUM_VALUE)[number];
export const RoleEnum: EnumType<RoleEnumType> = {
  ADMIN_SUPER: 'ADMIN_SUPER',
  ADMIN_STAFF: 'ADMIN_STAFF',
  PARTNER_SUPER: 'PARTNER_SUPER',
  PARTNER_STAFF: 'PARTNER_STAFF',
};
export const roleEnumSchema = z.enum(ROLE_ENUM_VALUE);

// Common product type enum for all schemas
export const PRODUCT_TYPE_ENUM_VALUE = [
  'HOTEL',
  'E-TICKET',
  'DELIVERY',
] as const;
// Product type for use in entities
export type ProductTypeEnumType = (typeof PRODUCT_TYPE_ENUM_VALUE)[number];
export const ProductTypeEnum: EnumType<ProductTypeEnumType> = {
  HOTEL: 'HOTEL',
  'E-TICKET': 'E-TICKET',
  DELIVERY: 'DELIVERY',
};
export const productTypeEnumSchema = z.enum(PRODUCT_TYPE_ENUM_VALUE);

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

// Common delivery fee type enum for all schemas
export const DELIVERY_FEE_TYPE_ENUM_VALUE = [
  'PAID',
  'CONDITIONAL_FREE',
  'FREE',
] as const;
// Delivery fee type for use in entities
export type DeliveryFeeTypeEnumType =
  (typeof DELIVERY_FEE_TYPE_ENUM_VALUE)[number];
export const DeliveryFeeTypeEnum: EnumType<DeliveryFeeTypeEnumType> = {
  PAID: 'PAID',
  CONDITIONAL_FREE: 'CONDITIONAL_FREE',
  FREE: 'FREE',
};
export const deliveryFeeTypeEnumSchema = z.enum(DELIVERY_FEE_TYPE_ENUM_VALUE);

// Common product status enum for all schemas
export const PRODUCT_STATUS_ENUM_VALUE = [
  'VISIBLE',
  'HIDDEN',
  'SOLD_OUT',
] as const;
// Product status type for use in entities
export type ProductStatusEnumType = (typeof PRODUCT_STATUS_ENUM_VALUE)[number];
export const ProductStatusEnum: EnumType<ProductStatusEnumType> = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
  SOLD_OUT: 'SOLD_OUT',
};
export const productStatusEnumSchema = z.enum(PRODUCT_STATUS_ENUM_VALUE);

// Admin list response schema
export const adminListItemSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
});

export const adminListSchema = z.array(adminListItemSchema);

// Admin detail response schema
export const adminDetailSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
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
  role: roleEnumSchema,
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

// Admin delete input schema
export const deleteAdminInputSchema = z.object({
  id: z.number(),
});

// Admin delete response schema
export const deleteAdminResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Admin create input schema
export const createAdminInputSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름은 필수입니다'),
  phoneNumber: z.string().min(1, '전화번호는 필수입니다'),
  role: roleEnumSchema,
});
