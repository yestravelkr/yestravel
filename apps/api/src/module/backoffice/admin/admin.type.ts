import { z } from 'zod';
import {
  adminListItemSchema,
  adminListSchema,
  adminDetailSchema,
  findAdminByIdInputSchema,
} from './admin.schema';

export type AdminListItem = z.infer<typeof adminListItemSchema>;
export type AdminList = z.infer<typeof adminListSchema>;
export type AdminDetail = z.infer<typeof adminDetailSchema>;
export type FindAdminByIdInput = z.infer<typeof findAdminByIdInputSchema>;