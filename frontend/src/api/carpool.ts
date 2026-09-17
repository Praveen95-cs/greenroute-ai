import { apiClient } from './client';
import type { CarpoolMatch, CarpoolRequestInput } from '../types/carpool';

export async function createCarpoolRequest(input: CarpoolRequestInput) {
  const { data } = await apiClient.post<{
    success: boolean;
    data: { request: unknown; matches: CarpoolMatch[]; matchCount: number };
  }>('/api/v1/carpool/request', input);
  return data.data;
}

export async function getCarpoolMatches(): Promise<CarpoolMatch[]> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { matches: CarpoolMatch[] };
  }>('/api/v1/carpool/matches');
  return data.data.matches;
}

export async function acceptCarpoolMatch(matchId: string) {
  const { data } = await apiClient.post<{ success: boolean; data: { match: CarpoolMatch } }>(
    `/api/v1/carpool/${matchId}/accept`,
  );
  return data.data.match;
}
