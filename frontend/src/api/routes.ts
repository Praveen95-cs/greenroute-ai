import { apiClient } from './client';
import type {
  RouteDetailResponse,
  RouteSearchInput,
  RouteSearchResponse,
  ScoringWeights,
} from '../types/route';

export async function searchRoutes(input: RouteSearchInput): Promise<RouteSearchResponse['data']> {
  const { data } = await apiClient.post<RouteSearchResponse>('/api/v1/routes/search', input);
  return data.data;
}

export async function getRoute(routeId: string): Promise<RouteDetailResponse['data']> {
  const { data } = await apiClient.get<RouteDetailResponse>(`/api/v1/routes/${routeId}`);
  return data.data;
}

export async function rankRoutes(
  routeId: string,
  weights: ScoringWeights,
): Promise<{ options: RouteSearchResponse['data']['options']; weightsUsed: ScoringWeights }> {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { options: RouteSearchResponse['data']['options']; weightsUsed: ScoringWeights };
  }>(`/api/v1/routes/${routeId}/rank`, { weights });

  return data.data;
}
