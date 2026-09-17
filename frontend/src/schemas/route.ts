import { z } from 'zod';

export const routeSearchSchema = z.object({
  sourceLabel: z.string().min(1, 'Source is required'),
  sourceLat: z.number().min(-90).max(90),
  sourceLng: z.number().min(-180).max(180),
  destLabel: z.string().min(1, 'Destination is required'),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  departureTime: z.string().min(1),
  arrivalDeadline: z.string().optional(),
  transportModes: z.array(z.string()).optional(),
});

export type RouteSearchFormValues = z.infer<typeof routeSearchSchema>;

export const PRESET_LOCATIONS = [
  { label: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
  { label: 'Anna University', lat: 13.0067, lng: 80.2206 },
  { label: 'T Nagar', lat: 13.0418, lng: 80.2341 },
  { label: 'Chennai Airport', lat: 12.9941, lng: 80.1709 },
  { label: 'Marina Beach', lat: 13.0500, lng: 80.2824 },
] as const;

export const MODE_OPTIONS = [
  'WALK',
  'BIKE',
  'BUS',
  'METRO',
  'TRAIN',
  'CAR',
  'CARPOOL',
  'AUTO',
] as const;
