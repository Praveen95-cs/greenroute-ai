import { Request, Response } from 'express';
import { normalizeWeights } from '../algorithms/route-ranking/routeRanker';
import { geocodePlaces } from '../services/route/geocode.service';
import { routeService } from '../services/route/route.service';
import { DEFAULT_SCORING_WEIGHTS } from '../types/route.types';
import { geocodeQuerySchema, routeRankSchema, routeSearchSchema } from '../validators/route.validator';

export async function searchRoutes(req: Request, res: Response): Promise<void> {
  const input = routeSearchSchema.parse(req.body);

  const result = await routeService.searchRoutes(req.user!.id, {
    source: input.source,
    destination: input.destination,
    departureTime: input.departureTime,
    arrivalDeadline: input.arrivalDeadline,
    transportModes: input.transportModes,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function geocodeLocations(req: Request, res: Response): Promise<void> {
  const { q } = geocodeQuerySchema.parse(req.query);
  const results = await geocodePlaces(q);

  res.json({
    success: true,
    data: results,
  });
}

export async function rankRoutes(req: Request, res: Response): Promise<void> {
  const { weights } = routeRankSchema.parse(req.body);
  const normalizedWeights = normalizeWeights(weights ?? DEFAULT_SCORING_WEIGHTS);

  const result = await routeService.rankRoutes(
    req.params.id as string,
    req.user!.id,
    normalizedWeights,
  );

  res.json({
    success: true,
    data: result,
  });
}

export async function getRoute(req: Request, res: Response): Promise<void> {
  const result = await routeService.getRouteById(req.params.id as string);

  res.json({
    success: true,
    data: result,
  });
}
