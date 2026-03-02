import { z } from 'zod';

export const PARTNER_TYPE_VALUE = ['BRAND', 'INFLUENCER'] as const;
export const partnerTypeSchema = z.enum(PARTNER_TYPE_VALUE);
export type PartnerType = z.infer<typeof partnerTypeSchema>;

export const partnerLoginInputSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다.'),
  password: z.string(),
  partnerType: partnerTypeSchema,
});
export type PartnerLoginInput = z.infer<typeof partnerLoginInputSchema>;

export const partnerLoginOutputSchema = z.object({
  accessToken: z.string(),
});
export type PartnerLoginOutput = z.infer<typeof partnerLoginOutputSchema>;
