import { haversineDistanceKm } from '../../utils/geo';

export interface CarpoolTrip {
  id: string;
  userId: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  departureTime: Date;
  maxDetourKm: number;
}

export interface CarpoolMatchResult {
  matchedUserId: string;
  compatibilityScore: number;
  detourKm: number;
  breakdown: {
    originScore: number;
    destinationScore: number;
    timeScore: number;
    detourScore: number;
  };
}

const WEIGHTS = {
  origin: 0.3,
  destination: 0.3,
  time: 0.25,
  detour: 0.15,
};

const MAX_ORIGIN_KM = 2;
const MAX_DEST_KM = 2;
const MAX_TIME_DIFF_MIN = 30;

export function computeCompatibility(
  request: CarpoolTrip,
  candidate: CarpoolTrip,
): CarpoolMatchResult | null {
  if (request.userId === candidate.userId) return null;

  const originKm = haversineDistanceKm(
    request.originLat,
    request.originLng,
    candidate.originLat,
    candidate.originLng,
  );
  const destKm = haversineDistanceKm(
    request.destLat,
    request.destLng,
    candidate.destLat,
    candidate.destLng,
  );

  const timeDiffMin =
    Math.abs(request.departureTime.getTime() - candidate.departureTime.getTime()) / 60_000;

  const directKm = haversineDistanceKm(
    request.originLat,
    request.originLng,
    request.destLat,
    request.destLng,
  );
  const viaCandidateKm =
    haversineDistanceKm(
      request.originLat,
      request.originLng,
      candidate.originLat,
      candidate.originLng,
    ) +
    haversineDistanceKm(
      candidate.originLat,
      candidate.originLng,
      candidate.destLat,
      candidate.destLng,
    );
  const detourKm = Math.max(0, viaCandidateKm - directKm);

  if (originKm > MAX_ORIGIN_KM * 2 || destKm > MAX_DEST_KM * 2) return null;
  if (timeDiffMin > MAX_TIME_DIFF_MIN * 2) return null;
  if (detourKm > Math.min(request.maxDetourKm, candidate.maxDetourKm) * 2) return null;

  const originScore = scoreLowerIsBetter(originKm, MAX_ORIGIN_KM);
  const destinationScore = scoreLowerIsBetter(destKm, MAX_DEST_KM);
  const timeScore = scoreLowerIsBetter(timeDiffMin, MAX_TIME_DIFF_MIN);
  const detourScore = scoreLowerIsBetter(detourKm, Math.min(request.maxDetourKm, candidate.maxDetourKm));

  const compatibilityScore =
    WEIGHTS.origin * originScore +
    WEIGHTS.destination * destinationScore +
    WEIGHTS.time * timeScore +
    WEIGHTS.detour * detourScore;

  if (compatibilityScore < 0.4) return null;

  return {
    matchedUserId: candidate.userId,
    compatibilityScore: Math.round(compatibilityScore * 1000) / 1000,
    detourKm: Math.round(detourKm * 100) / 100,
    breakdown: {
      originScore: Math.round(originScore * 1000) / 1000,
      destinationScore: Math.round(destinationScore * 1000) / 1000,
      timeScore: Math.round(timeScore * 1000) / 1000,
      detourScore: Math.round(detourScore * 1000) / 1000,
    },
  };
}

function scoreLowerIsBetter(value: number, max: number): number {
  return Math.max(0, 1 - value / max);
}

export function findCompatibleMatches(
  request: CarpoolTrip,
  candidates: CarpoolTrip[],
): CarpoolMatchResult[] {
  return candidates
    .map((c) => computeCompatibility(request, c))
    .filter((m): m is CarpoolMatchResult => m !== null)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
