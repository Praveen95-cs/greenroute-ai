import { RawRouteCandidate, RouteSearchParams } from '../../types/route.types';

export interface TransportModeData {
  code: string;
  name: string;
  co2GramsPerKm: number;
  avgCostPerKm: number;
  avgSpeedKmh: number;
}

export interface RouteProvider {
  search(
    params: RouteSearchParams,
    straightLineKm: number,
    transportModes: TransportModeData[],
  ): Promise<RawRouteCandidate[]>;
}
