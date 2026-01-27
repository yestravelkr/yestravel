import { z } from 'zod';

/**
 * Brand 관련 Enum 및 Schema
 */

export const SOCIAL_MEDIA_PLATFORM_ENUM_VALUE = [
  'INSTAGRAM',
  'FACEBOOK',
  'TWITTER',
  'YOUTUBE',
  'TIKTOK',
  'OTHER',
] as const;

export const socialMediaPlatformEnumSchema = z.enum(SOCIAL_MEDIA_PLATFORM_ENUM_VALUE);

/**
 * Role Enum (브랜드 매니저 권한)
 */
export const ROLE_ENUM_VALUE = [
  'ADMIN_SUPER',
  'ADMIN_STAFF',
  'PARTNER_SUPER',
  'PARTNER_STAFF',
] as const;

export const roleEnumSchema = z.enum(ROLE_ENUM_VALUE);

/**
 * Brand Manager Schema
 */
export const brandManagerSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  role: roleEnumSchema,
  createdAt: z.date(),
});
