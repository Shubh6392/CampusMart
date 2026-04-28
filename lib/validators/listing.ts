import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  price: z.number().min(1),
  category: z.string().min(1),
  condition: z.enum(['new', 'like new', 'good', 'fair', 'used']),
  images: z.array(z.string().url()).min(1),
  campus: z.string().min(2),
  tags: z.array(z.string()).optional()
});

export const updateListingSchema = createListingSchema.partial();
