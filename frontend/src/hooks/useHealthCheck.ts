import { useQuery } from '@tanstack/react-query';
import { fetchHealth, fetchReadiness } from '../api/client';

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useReadinessCheck() {
  return useQuery({
    queryKey: ['readiness'],
    queryFn: fetchReadiness,
    refetchInterval: 30_000,
    retry: 1,
  });
}
