import { z } from 'zod';

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().min(1).max(200).trim(),
});

export const routeSearchSchema = z.object({
  source: geoPointSchema,
  destination: geoPointSchema,
  departureTime: z.coerce.date(),
  arrivalDeadline: z.coerce.date().optional(),
  transportModes: z.array(z.string().trim().toUpperCase()).optional(),
});

export const routeRankSchema = z.object({
  weights: z
    .object({
      time: z.number().min(0).max(1),
      cost: z.number().min(0).max(1),
      carbon: z.number().min(0).max(1),
      reliability: z.number().min(0).max(1),
      walking: z.number().min(0).max(1),
    })
    .optional(),
});

export const geocodeQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
});

export type RouteSearchInput = z.infer<typeof routeSearchSchema>;
export type RouteRankInput = z.infer<typeof routeRankSchema>;
