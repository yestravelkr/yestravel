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
