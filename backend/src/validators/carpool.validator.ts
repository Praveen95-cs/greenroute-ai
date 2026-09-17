import { z } from 'zod';

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().min(1).max(200).trim(),
});

export const carpoolRequestSchema = z.object({
  origin: geoPointSchema,
  destination: geoPointSchema,
  departureTime: z.coerce.date(),
  availableSeats: z.number().int().min(1).max(8).default(1),
  maxDetourKm: z.number().min(0).max(20).default(2),
});

export type CarpoolRequestInput = z.infer<typeof carpoolRequestSchema>;
