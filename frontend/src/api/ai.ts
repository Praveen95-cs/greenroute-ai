import { apiClient } from './client';
import type { MobilityQueryResponse } from '../types/ai';

export async function mobilityQuery(
  query: string,
  defaultSourceLabel?: string,
): Promise<MobilityQueryResponse['data']> {
  const { data } = await apiClient.post<MobilityQueryResponse>('/api/v1/ai/mobility-query', {
    query,
    defaultSourceLabel,
  });
  return data.data;
}
