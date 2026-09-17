export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteScores {
  time: number;
  carbon: number;
  cost: number;
  reliability: number;
  walking: number;
  sustainability: number;
}

export interface RouteOption {
  id: string;
  transportMode: { code: string; name: string };
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: number;
  estimatedCo2Grams: number;
  walkingMinutes: number;
  reliabilityScore: number;
  compositeScore: number | null;
  isRecommended: boolean;
  scores: RouteScores | null;
  metadata?: Record<string, unknown>;
}

export interface SavedRoute {
  id: string;
  source: GeoPoint;
  destination: GeoPoint;
  departureTime: string;
  straightLineKm: number;
  createdAt: string;
}

export interface RouteSearchInput {
  source: GeoPoint;
  destination: GeoPoint;
  departureTime: string;
  arrivalDeadline?: string;
  transportModes?: string[];
}

export interface RouteSearchResponse {
  success: boolean;
  data: {
    route: SavedRoute;
    options: RouteOption[];
    recommendedOptionId: string | null;
    weightsUsed: Record<string, number>;
    disclaimer: string;
    straightLineKm: number;
  };
}

export interface RouteDetailResponse {
  success: boolean;
  data: {
    route: SavedRoute;
    options: RouteOption[];
    recommendedOptionId: string | null;
  };
}

export interface ScoringWeights {
  time: number;
  cost: number;
  carbon: number;
  reliability: number;
  walking: number;
}
