import { PartnerType } from './partner-auth.schema';
import { RoleEnumType } from '@src/module/backoffice/admin/admin.schema';

export type PartnerAuthPayload = {
  id: number;
  email: string;
  partnerType: PartnerType;
  role: RoleEnumType;
  partnerId: number;
};
