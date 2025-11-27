import { z } from 'zod';

/**
 * Brand 관련 Enum 및 Schema
 */

export const BUSINESS_TYPE_ENUM_VALUE = [
  'INDIVIDUAL',
  'CORPORATE',
] as const;

export const SOCIAL_MEDIA_PLATFORM_ENUM_VALUE = [
  'INSTAGRAM',
  'FACEBOOK',
  'TWITTER',
  'YOUTUBE',
  'TIKTOK',
  'WEBSITE',
] as const;

export const socialMediaPlatformEnumSchema = z.enum(SOCIAL_MEDIA_PLATFORM_ENUM_VALUE);

export const businessInfoSchema = z.object({
  type: z.enum(BUSINESS_TYPE_ENUM_VALUE).nullish(),
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
