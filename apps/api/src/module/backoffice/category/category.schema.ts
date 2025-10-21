import { z } from 'zod';
import { productTypeEnumSchema } from '@src/module/backoffice/admin/admin.schema';

// Category create input schema
export const createCategoryInputSchema = z.object({
  name: z.string().min(1, '카테고리 이름은 필수입니다'),
  productType: productTypeEnumSchema,
  parentId: z.number().nullish(),
});

// Category response schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  productType: z.string(),
  parentId: z.number().nullish(),
  level: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Category list schema
export const categoryListSchema = z.array(categorySchema);

// Find all categories input schema (with optional productType filter)
export const findAllCategoriesInputSchema = z.object({
  productType: productTypeEnumSchema.optional(),
});
