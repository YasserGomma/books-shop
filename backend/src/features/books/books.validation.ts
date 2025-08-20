import { z } from 'zod';

export const createBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  price: z
    .number()
    .min(0, 'Price must be a positive number')
    .max(9999999.99, 'Price is too high'),
  categoryId: z
    .string()
    .uuid('Invalid category ID'),
  thumbnail: z
    .string()
    .url('Invalid thumbnail URL')
    .optional(),
  tags: z
    .array(z.string().uuid('Invalid tag ID'))
    .optional(),
});

export const updateBookSchema = createBookSchema.partial();

const baseQuerySchema = z.object({
  page: z.preprocess(
    (val) => val ? Number(val) : 1,
    z.number().min(1, 'Page must be at least 1').default(1)
  ),
  limit: z.preprocess(
    (val) => val ? Number(val) : 10,
    z.number().min(1).max(100, 'Limit must be between 1 and 100').default(10)
  ),
  search: z.string().max(255, 'Search term too long').optional(),
  sortBy: z.enum(['title']).default('title'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const booksQuerySchema = baseQuerySchema.extend({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  minPrice: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
  maxPrice: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(0).optional()
  ),
});

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

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(255, 'Tag name must be less than 255 characters'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BooksQueryInput = z.infer<typeof booksQuerySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;