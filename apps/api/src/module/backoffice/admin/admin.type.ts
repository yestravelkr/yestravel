import { z } from 'zod';
import {
  adminListItemSchema,
  adminListSchema,
  adminDetailSchema,
  findAdminByIdInputSchema,
  updateAdminInputSchema,
  updateAdminPasswordInputSchema,
  updateAdminPasswordResponseSchema,
  createAdminInputSchema,
} from './admin.schema';

export type AdminListItem = z.infer<typeof adminListItemSchema>;
export type AdminList = z.infer<typeof adminListSchema>;
export type AdminDetail = z.infer<typeof adminDetailSchema>;
export type FindAdminByIdInput = z.infer<typeof findAdminByIdInputSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminInputSchema>;
export type UpdateAdminPasswordInput = z.infer<
  typeof updateAdminPasswordInputSchema
>;
export type UpdateAdminPasswordResponse = z.infer<
  typeof updateAdminPasswordResponseSchema
>;
export type CreateAdminInput = z.infer<typeof createAdminInputSchema>;
