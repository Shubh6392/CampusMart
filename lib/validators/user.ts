import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  role: z.enum(['buyer', 'seller', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional()
});
