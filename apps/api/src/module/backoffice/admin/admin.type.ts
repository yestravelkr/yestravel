import { z } from 'zod';
import {
  adminListItemSchema,
  adminListSchema,
} from './admin.schema';

export type AdminListItem = z.infer<typeof adminListItemSchema>;
export type AdminList = z.infer<typeof adminListSchema>;