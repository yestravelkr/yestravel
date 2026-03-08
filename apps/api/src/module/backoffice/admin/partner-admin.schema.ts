import { z } from 'zod';
import { partnerTypeSchema } from '../../partner/auth/partner-auth.schema';
import { ROLE_ENUM_VALUE, roleEnumSchema } from './admin.schema';

/**
 * Partner Manager CRUD 스키마 정의
 * Brand/Influencer 매니저의 생성, 조회, 삭제를 위한 통합 스키마
 */

// createManager
export const createPartnerManagerInputSchema = z.object({
  partnerType: partnerTypeSchema,
  partnerId: z.number(),
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.enum(ROLE_ENUM_VALUE).optional(),
});
export type CreatePartnerManagerInput = z.infer<
  typeof createPartnerManagerInputSchema
>;

export const createPartnerManagerOutputSchema = z.object({
  id: z.number(),
  email: z.string(),
});

// findManagers
export const findPartnerManagersInputSchema = z.object({
  partnerType: partnerTypeSchema,
  partnerId: z.number(),
});
export type FindPartnerManagersInput = z.infer<
  typeof findPartnerManagersInputSchema
>;

export const partnerManagerListItemSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
  createdAt: z.date(),
});
export const partnerManagerListSchema = z.array(partnerManagerListItemSchema);

// deleteManager
export const deletePartnerManagerInputSchema = z.object({
  partnerType: partnerTypeSchema,
  id: z.number(),
  partnerId: z.number(),
});
export type DeletePartnerManagerInput = z.infer<
  typeof deletePartnerManagerInputSchema
>;

// findManagerById
export const findPartnerManagerByIdInputSchema = z.object({
  partnerType: partnerTypeSchema,
  id: z.number(),
});
export type FindPartnerManagerByIdInput = z.infer<
  typeof findPartnerManagerByIdInputSchema
>;

export const partnerManagerProfileSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
  partnerType: partnerTypeSchema,
  partnerId: z.number(),
});

// updateManagerRole
export const updatePartnerManagerRoleInputSchema = z.object({
  partnerType: partnerTypeSchema,
  id: z.number(),
  partnerId: z.number(),
  role: z.enum(ROLE_ENUM_VALUE),
});
export type UpdatePartnerManagerRoleInput = z.infer<
  typeof updatePartnerManagerRoleInputSchema
>;

export const updatePartnerManagerRoleOutputSchema = z.object({
  id: z.number(),
  email: z.string(),
  role: roleEnumSchema,
});
