import { z } from 'zod';

export const preferencesSchema = z.object({
  preferredTransport: z.string().optional(),
  maxWalkingDistanceM: z.string().optional(),
  maxBudget: z.string().optional(),
  sustainabilityPriority: z.number().int().min(0).max(100),
  timePriority: z.number().int().min(0).max(100),
});

export type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function parseOptionalNumber(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
