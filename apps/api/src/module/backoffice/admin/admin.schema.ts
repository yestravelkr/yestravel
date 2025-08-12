import { z } from 'zod';
import { RoleType } from '@src/module/backoffice/domain/role.enum';

// Admin list response schema
export const adminListItemSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(RoleType),
});

export const adminListSchema = z.array(adminListItemSchema);

// Admin detail response schema
export const adminDetailSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  role: z.nativeEnum(RoleType),
  createdAt: z.date(),
});

// Admin findById input schema
export const findAdminByIdInputSchema = z.object({
  id: z.number(),
});