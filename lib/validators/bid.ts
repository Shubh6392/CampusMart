import { z } from 'zod';

export const createBidSchema = z.object({
  listingId: z.string().min(1),
  amount: z.number().min(1)
});
