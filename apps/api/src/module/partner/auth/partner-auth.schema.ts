import { z } from 'zod';
import { RoleEnumType } from '@src/module/backoffice/admin/admin.schema';

export const PARTNER_TYPE_VALUE = ['BRAND', 'INFLUENCER'] as const;
export const partnerTypeSchema = z.enum(PARTNER_TYPE_VALUE);
export type PartnerType = z.infer<typeof partnerTypeSchema>;

export type PartnerAuthPayload = {
  id: number;
  email: string;
  partnerType: PartnerType;
  role: RoleEnumType;
  partnerId: number;
};
