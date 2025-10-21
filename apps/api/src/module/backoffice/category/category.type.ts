import { z } from 'zod';
import {
  createCategoryInputSchema,
  categorySchema,
  categoryListSchema,
  findAllCategoriesInputSchema,
} from './category.schema';

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategoryList = z.infer<typeof categoryListSchema>;
export type FindAllCategoriesInput = z.infer<
  typeof findAllCategoriesInputSchema
>;
