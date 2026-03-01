import { z } from 'zod';
import { EnumType } from '@src/types/utility.type';
import {
  businessInfoSchema,
  bankInfoSchema,
} from '@src/module/backoffice/brand/brand.schema';

// Social media platform enum
export const SOCIAL_MEDIA_PLATFORM_ENUM_VALUE = [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'FACEBOOK',
  'TWITTER',
  'OTHER',
] as const;

export type SocialMediaPlatformEnumType =
  (typeof SOCIAL_MEDIA_PLATFORM_ENUM_VALUE)[number];

export const SocialMediaPlatformEnum: EnumType<SocialMediaPlatformEnumType> = {
  INSTAGRAM: 'INSTAGRAM',
  TIKTOK: 'TIKTOK',
  YOUTUBE: 'YOUTUBE',
  FACEBOOK: 'FACEBOOK',
  TWITTER: 'TWITTER',
  OTHER: 'OTHER',
};

export const socialMediaPlatformEnumSchema = z.enum(
  SOCIAL_MEDIA_PLATFORM_ENUM_VALUE
);

// Social media schema
export const socialMediaSchema = z.object({
  id: z.number().optional(),
  platform: socialMediaPlatformEnumSchema,
  url: z.string().url('유효한 URL을 입력해주세요'),
});

// Influencer schema
export const influencerSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  thumbnail: z.string().nullish(),
  businessInfo: businessInfoSchema.nullish(),
  bankInfo: bankInfoSchema.nullish(),
  socialMedias: z.array(socialMediaSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create influencer input schema
export const createInfluencerInputSchema = z.object({
  name: z.string().min(1, '인플루언서명은 필수입니다'),
  slug: z
    .string()
    .min(1, '샵 URL은 필수입니다')
    .max(50, '샵 URL은 50자 이내로 입력해주세요')
    .regex(
      /^[a-z0-9_-]+$/,
      '샵 URL은 영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다'
    ),
  email: z.string().min(1, '이메일은 필수입니다').email('유효한 이메일을 입력해주세요'),
  phoneNumber: z.string().nullish(),
  thumbnail: z.string().nullish(),
  businessInfo: businessInfoSchema.nullish(),
  bankInfo: bankInfoSchema.nullish(),
  socialMedias: z
    .array(socialMediaSchema)
    .min(1, '최소 1개 이상의 소셜미디어가 필요합니다'),
});

// Update influencer input schema
export const updateInfluencerInputSchema = createInfluencerInputSchema.extend({
  id: z.number(),
});

// List response schema
export const influencerListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  email: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  thumbnail: z.string().nullish(),
  createdAt: z.date(),
});

export const influencerListSchema = z.object({
  data: z.array(influencerListItemSchema),
  total: z.number(),
});
