import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  page: z.preprocess(
    (val) => val ? Number(val) : 1,
    z.number().min(1, 'Page must be at least 1').default(1)
  ),
  limit: z.preprocess(
    (val) => val ? Number(val) : 10,
    z.number().min(1).max(100, 'Limit must be between 1 and 100').default(10)
  ),
  search: z.string().max(255, 'Search term too long').optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .refine(val => val.length === 0 || val.length >= 2, 'First name must be at least 2 characters if provided')
    .refine(val => val.length <= 50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z
    .string()
    .refine(val => val.length === 0 || val.length >= 2, 'Last name must be at least 2 characters if provided')
    .refine(val => val.length <= 50, 'Last name must be less than 50 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
});

export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;