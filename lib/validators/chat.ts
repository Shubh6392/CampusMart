import { z } from 'zod';

export const createMessageSchema = z.object({
  conversationId: z.string().min(1),
  listingId: z.string().min(1),
  recipientId: z.string().min(1),
  content: z.string().min(1).max(2000)
});
