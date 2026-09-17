export interface ModeConfig {
  routeFactor: number;
  baseFare: number;
  reliability: number;
  maxDistanceKm?: number;
  walkingMinutes: (distanceKm: number) => number;
  transferMinutes: number;
  osrmProfile: 'driving' | 'walking' | 'cycling';
}

export const MODE_CONFIG: Record<string, ModeConfig> = {
  WALK: {
    routeFactor: 1,
    baseFare: 0,
    reliability: 0.95,
    maxDistanceKm: 5,
    walkingMinutes: (d) => Math.round((d / 5) * 60),
    transferMinutes: 0,
    osrmProfile: 'walking',
  },
  BIKE: {
    routeFactor: 1.15,
    baseFare: 0,
    reliability: 0.9,
    maxDistanceKm: 20,
    walkingMinutes: () => 2,
    transferMinutes: 3,
    osrmProfile: 'cycling',
  },
  BUS: {
    routeFactor: 1.35,
    baseFare: 15,
    reliability: 0.72,
    walkingMinutes: (d) => Math.min(15, Math.round(5 + d * 0.5)),
    transferMinutes: 8,
    osrmProfile: 'driving',
  },
  METRO: {
    routeFactor: 1.25,
    baseFare: 20,
    reliability: 0.88,
    walkingMinutes: (d) => Math.min(12, Math.round(4 + d * 0.3)),
    transferMinutes: 5,
    osrmProfile: 'driving',
  },
  TRAIN: {
    routeFactor: 1.2,
    baseFare: 30,
    reliability: 0.85,
    walkingMinutes: (d) => Math.min(10, Math.round(6 + d * 0.2)),
    transferMinutes: 10,
    osrmProfile: 'driving',
  },
  CAR: {
    routeFactor: 1.15,
    baseFare: 0,
    reliability: 0.82,
    walkingMinutes: () => 3,
    transferMinutes: 0,
    osrmProfile: 'driving',
  },
  CARPOOL: {
    routeFactor: 1.18,
    baseFare: 0,
    reliability: 0.78,
    walkingMinutes: () => 5,
    transferMinutes: 5,
    osrmProfile: 'driving',
  },
  AUTO: {
    routeFactor: 1.3,
    baseFare: 40,
    reliability: 0.7,
    walkingMinutes: () => 2,
    transferMinutes: 0,
    osrmProfile: 'driving',
  },
};

export const LIVE_ROUTE_DISCLAIMER =
  'Travel paths and times use live OpenStreetMap routing (OSRM). Cost and CO₂ estimates are calculated by GreenRoute’s sustainability engine, not the map provider.';

export const DEMO_ROUTE_DISCLAIMER =
  'Route distances, times, costs, and emissions are model-based estimates for demonstration. They are not live navigation data.';
