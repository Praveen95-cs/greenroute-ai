import { MODE_CONFIG } from './modeConfig';
import { RouteProvider, TransportModeData } from './routeProvider.types';
import { RawRouteCandidate, RouteSearchParams } from '../../types/route.types';

export type { RouteProvider, TransportModeData } from './routeProvider.types';

/**
 * Demo route provider — generates model-based candidates from straight-line distance.
 * Used in tests and as a fallback when live routing is unavailable.
 */
export class DemoRouteProvider implements RouteProvider {
  async search(
    params: RouteSearchParams,
    straightLineKm: number,
    transportModes: TransportModeData[],
  ): Promise<RawRouteCandidate[]> {
    const requestedModes = params.transportModes?.length
      ? params.transportModes.map((m) => m.toUpperCase())
      : transportModes.map((m) => m.code);

    const candidates: RawRouteCandidate[] = [];

    for (const mode of transportModes) {
      if (!requestedModes.includes(mode.code)) continue;

      const config = MODE_CONFIG[mode.code];
      if (!config) continue;

      const distanceKm = straightLineKm * config.routeFactor;
      if (config.maxDistanceKm && distanceKm > config.maxDistanceKm) continue;

      const travelMinutes = Math.max(1, Math.round((distanceKm / mode.avgSpeedKmh) * 60));
      const durationMinutes = travelMinutes + config.transferMinutes;
      const walkingMinutes = config.walkingMinutes(distanceKm);

      if (params.arrivalDeadline) {
        const arrivalTime = new Date(params.departureTime.getTime() + durationMinutes * 60_000);
        if (arrivalTime > params.arrivalDeadline) continue;
      }

      candidates.push({
        transportModeCode: mode.code,
        distanceKm,
        durationMinutes,
        walkingMinutes,
        reliabilityScore: config.reliability,
        baseFare: config.baseFare,
        metadata: {
          provider: 'demo',
          routeFactor: config.routeFactor,
          straightLineKm,
          avgSpeedKmh: mode.avgSpeedKmh,
          geometry: [
            [params.source.lat, params.source.lng],
            [params.destination.lat, params.destination.lng],
          ],
        },
      });
    }

    return candidates;
  }
}
