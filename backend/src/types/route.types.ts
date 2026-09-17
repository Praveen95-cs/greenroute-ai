export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteSearchParams {
  source: GeoPoint;
  destination: GeoPoint;
  departureTime: Date;
  arrivalDeadline?: Date;
  transportModes?: string[];
}

export interface RawRouteCandidate {
  transportModeCode: string;
  distanceKm: number;
  durationMinutes: number;
  walkingMinutes: number;
  reliabilityScore: number;
  baseFare: number;
  metadata: Record<string, unknown>;
}

export interface RouteScores {
  time: number;
  carbon: number;
  cost: number;
  reliability: number;
  walking: number;
  sustainability: number;
}

export interface ScoringWeights {
  time: number;
  cost: number;
  carbon: number;
  reliability: number;
  walking: number;
}

export interface RankedRouteOption {
  transportModeCode: string;
  transportModeName: string;
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: number;
  estimatedCo2Grams: number;
  walkingMinutes: number;
  reliabilityScore: number;
  scores: RouteScores;
  compositeScore: number;
  isRecommended: boolean;
  metadata: Record<string, unknown>;
}

export interface RouteSearchResult {
  source: GeoPoint;
  destination: GeoPoint;
  departureTime: Date;
  distanceKm: number;
  options: RankedRouteOption[];
  recommendedOptionIndex: number;
  weightsUsed: ScoringWeights;
  disclaimer: string;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  time: 0.25,
  cost: 0.2,
  carbon: 0.3,
  reliability: 0.15,
  walking: 0.1,
};

export const ROUTE_DATA_DISCLAIMER =
  'Route distances, times, costs, and emissions are model-based estimates for demonstration. They are not live navigation data.';
