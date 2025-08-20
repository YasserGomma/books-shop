import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;