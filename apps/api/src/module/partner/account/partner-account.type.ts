import { z } from 'zod';
import {
  createStaffInputSchema,
  deleteStaffInputSchema,
  staffItemSchema,
  profileOutputSchema,
} from './partner-account.schema';

export type CreateStaffInput = z.infer<typeof createStaffInputSchema>;
export type DeleteStaffInput = z.infer<typeof deleteStaffInputSchema>;
export type StaffItem = z.infer<typeof staffItemSchema>;
export type ProfileOutput = z.infer<typeof profileOutputSchema>;

export type CreateStaffData = CreateStaffInput & {
  partnerType: 'BRAND' | 'INFLUENCER';
  partnerId: number;
};

export type DeleteStaffData = DeleteStaffInput & {
  partnerType: 'BRAND' | 'INFLUENCER';
  partnerId: number;
};

export type FindAllStaffData = {
  partnerType: 'BRAND' | 'INFLUENCER';
  partnerId: number;
};

export type GetProfileData = {
  id: number;
  partnerType: 'BRAND' | 'INFLUENCER';
};
