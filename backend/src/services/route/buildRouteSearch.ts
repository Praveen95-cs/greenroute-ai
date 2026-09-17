import { rankRouteOptions } from '../../algorithms/route-ranking/routeRanker';
import {
  DEFAULT_SCORING_WEIGHTS,
  RouteSearchParams,
  RouteSearchResult,
  ScoringWeights,
} from '../../types/route.types';
import { haversineDistanceKm } from '../../utils/geo';
import { sustainabilityEngine } from '../sustainability/sustainabilityEngine.service';
import { DemoRouteProvider } from './demoRouteProvider.service';
import { DEMO_ROUTE_DISCLAIMER, LIVE_ROUTE_DISCLAIMER } from './modeConfig';
import { OsrmRouteProvider } from './osrmRouteProvider.service';
import { env } from '../../config/env';
import { RouteProvider, TransportModeData } from './routeProvider.types';

export function getRouteProvider(): RouteProvider {
  if (env.ROUTING_PROVIDER === 'demo') {
    return new DemoRouteProvider();
  }
  return new OsrmRouteProvider();
}

export async function buildRouteSearchResult(
  params: RouteSearchParams,
  transportModes: TransportModeData[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
  provider: RouteProvider = getRouteProvider(),
): Promise<RouteSearchResult> {
  const straightLineKm = haversineDistanceKm(
    params.source.lat,
    params.source.lng,
    params.destination.lat,
    params.destination.lng,
  );

  let usedLive = provider instanceof OsrmRouteProvider;
  let rawCandidates;

  try {
    rawCandidates = await provider.search(params, straightLineKm, transportModes);
  } catch {
    usedLive = false;
    rawCandidates = await new DemoRouteProvider().search(params, straightLineKm, transportModes);
  }

  if (rawCandidates.length === 0) {
    usedLive = false;
    rawCandidates = await new DemoRouteProvider().search(params, straightLineKm, transportModes);
  }

  const modeMap = new Map(transportModes.map((m) => [m.code, m]));

  const enriched = rawCandidates.map((candidate) => {
    const mode = modeMap.get(candidate.transportModeCode)!;
    const metrics = sustainabilityEngine.calculateMetrics({
      distanceKm: candidate.distanceKm,
      co2GramsPerKm: mode.co2GramsPerKm,
      avgCostPerKm: mode.avgCostPerKm,
      baseFare: candidate.baseFare,
    });

    return {
      transportModeCode: candidate.transportModeCode,
      transportModeName: mode.name,
      durationMinutes: candidate.durationMinutes,
      distanceKm: candidate.distanceKm,
      estimatedCost: metrics.estimatedCost,
      estimatedCo2Grams: metrics.estimatedCo2Grams,
      walkingMinutes: candidate.walkingMinutes,
      reliabilityScore: candidate.reliabilityScore,
      metadata: candidate.metadata,
    };
  });

  const ranked = rankRouteOptions(enriched, weights);

  return {
    source: params.source,
    destination: params.destination,
    departureTime: params.departureTime,
    distanceKm: straightLineKm,
    options: ranked,
    recommendedOptionIndex: ranked.findIndex((o) => o.isRecommended),
    weightsUsed: weights,
    disclaimer: usedLive ? LIVE_ROUTE_DISCLAIMER : DEMO_ROUTE_DISCLAIMER,
  };
}
