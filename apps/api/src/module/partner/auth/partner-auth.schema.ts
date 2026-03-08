import { z } from 'zod';

export const PARTNER_TYPE_VALUE = ['BRAND', 'INFLUENCER'] as const;
export const partnerTypeSchema = z.enum(PARTNER_TYPE_VALUE);
export type PartnerType = z.infer<typeof partnerTypeSchema>;
