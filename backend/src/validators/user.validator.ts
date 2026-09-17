import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).max(100).trim().optional(),
    lastName: z.string().min(1).max(100).trim().optional(),
  })
  .refine((data) => data.firstName !== undefined || data.lastName !== undefined, {
    message: 'At least one field must be provided',
  });

export const updatePreferencesSchema = z.object({
  preferredTransport: z.string().max(50).trim().nullable().optional(),
  maxWalkingDistanceM: z.number().int().min(0).max(10000).nullable().optional(),
  maxBudget: z.number().min(0).max(1_000_000).nullable().optional(),
  sustainabilityPriority: z.number().int().min(0).max(100).optional(),
  timePriority: z.number().int().min(0).max(100).optional(),
  accessibilityNeeds: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
