import { GeoPoint, RawRouteCandidate, RouteSearchParams } from '../../types/route.types';
import { MODE_CONFIG, ModeConfig } from './modeConfig';
import { RouteProvider, TransportModeData } from './routeProvider.types';
import { env } from '../../config/env';

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

export interface ProfileRoute {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
}

function toLatLng(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

async function fetchOsrmProfile(
  profile: 'driving' | 'walking' | 'cycling',
  source: GeoPoint,
  destination: GeoPoint,
): Promise<ProfileRoute | null> {
  const url = `${env.OSRM_BASE_URL}/route/v1/${profile}/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GreenRoute-AI/0.1' },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OsrmResponse;
    const route = data.routes?.[0];
    if (data.code !== 'Ok' || !route) return null;

    return {
      distanceKm: route.distance / 1000,
      durationMinutes: Math.max(1, Math.round(route.duration / 60)),
      geometry: toLatLng(route.geometry.coordinates),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export class OsrmRouteProvider implements RouteProvider {
  async search(
    params: RouteSearchParams,
    _straightLineKm: number,
    transportModes: TransportModeData[],
  ): Promise<RawRouteCandidate[]> {
    const requestedModes = params.transportModes?.length
      ? params.transportModes.map((m) => m.toUpperCase())
      : transportModes.map((m) => m.code);

    const profiles = new Set<'driving' | 'walking' | 'cycling'>();
    for (const mode of transportModes) {
      if (!requestedModes.includes(mode.code)) continue;
      const config = MODE_CONFIG[mode.code];
      if (config) profiles.add(config.osrmProfile);
    }

    const profileResults = new Map<string, ProfileRoute | null>();
    await Promise.all(
      [...profiles].map(async (profile) => {
        profileResults.set(
          profile,
          await fetchOsrmProfile(profile, params.source, params.destination),
        );
      }),
    );

    const liveCount = [...profileResults.values()].filter(Boolean).length;
    if (liveCount === 0) {
      throw new Error('OSRM returned no routes');
    }

    const candidates: RawRouteCandidate[] = [];

    for (const mode of transportModes) {
      if (!requestedModes.includes(mode.code)) continue;

      const config = MODE_CONFIG[mode.code];
      if (!config) continue;

      const live = profileResults.get(config.osrmProfile);
      if (!live) continue;

      if (config.maxDistanceKm && live.distanceKm > config.maxDistanceKm) continue;

      const durationMinutes = live.durationMinutes + config.transferMinutes;
      const walkingMinutes =
        mode.code === 'WALK' ? live.durationMinutes : config.walkingMinutes(live.distanceKm);

      if (params.arrivalDeadline) {
        const arrivalTime = new Date(params.departureTime.getTime() + durationMinutes * 60_000);
        if (arrivalTime > params.arrivalDeadline) continue;
      }

      candidates.push(buildCandidate(mode.code, config, live, walkingMinutes, durationMinutes));
    }

    if (candidates.length === 0) {
      throw new Error('No OSRM candidates matched requested modes');
    }

    return candidates;
  }
}

function buildCandidate(
  code: string,
  config: ModeConfig,
  live: ProfileRoute,
  walkingMinutes: number,
  durationMinutes: number,
): RawRouteCandidate {
  return {
    transportModeCode: code,
    distanceKm: live.distanceKm,
    durationMinutes,
    walkingMinutes,
    reliabilityScore: config.reliability,
    baseFare: config.baseFare,
    metadata: {
      provider: 'osrm',
      osrmProfile: config.osrmProfile,
      geometry: live.geometry,
    },
  };
}
