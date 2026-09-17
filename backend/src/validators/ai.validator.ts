import { z } from 'zod';

export const mobilityQuerySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(2000),
  defaultSourceLabel: z.string().max(200).optional(),
});

export type MobilityQueryInput = z.infer<typeof mobilityQuerySchema>;
