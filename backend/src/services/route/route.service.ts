import { Prisma, TransportMode } from '@prisma/client';
import {
  applyConstraints,
  deriveWeightsFromPreferences,
  rankRouteOptions,
} from '../../algorithms/route-ranking/routeRanker';
import { prisma } from '../../config/database';
import {
  RankedRouteOption,
  RouteSearchParams,
  ScoringWeights,
} from '../../types/route.types';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { haversineDistanceKm } from '../../utils/geo';
import { sustainabilityEngine } from '../sustainability/sustainabilityEngine.service';
import { buildRouteSearchResult } from './buildRouteSearch';

function toJsonMetadata(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export const routeService = {
  async searchRoutes(
    userId: string,
    params: RouteSearchParams,
    customWeights?: ScoringWeights,
    overrides?: { maxBudget?: number; maxWalkingMinutes?: number },
  ) {
    const [transportModes, preferences] = await Promise.all([
      prisma.transportMode.findMany({ where: { isActive: true } }),
      prisma.userPreference.findUnique({ where: { userId } }),
    ]);

    if (transportModes.length === 0) {
      throw new ValidationError('No transport modes configured');
    }

    const weights = customWeights ?? deriveWeightsFromPreferences(preferences ?? undefined);

    const searchResult = await buildRouteSearchResult(params, transportModes, weights);

    const maxWalkingMinutes =
      overrides?.maxWalkingMinutes ??
      (preferences?.maxWalkingDistanceM
        ? Math.ceil(preferences.maxWalkingDistanceM / 80)
        : null);

    const filteredOptions = applyConstraints(searchResult.options, {
      maxBudget: overrides?.maxBudget ?? preferences?.maxBudget,
      maxWalkingMinutes,
    });

    if (filteredOptions.length === 0) {
      throw new ValidationError(
        'No routes match your preferences. Try adjusting budget or walking limits.',
      );
    }

    const recommended = filteredOptions.find((o) => o.isRecommended) ?? filteredOptions[0];
    filteredOptions.forEach((o) => {
      o.isRecommended = o.transportModeCode === recommended.transportModeCode;
    });

    const savedRoute = await prisma.route.create({
      data: {
        sourceLat: params.source.lat,
        sourceLng: params.source.lng,
        sourceLabel: params.source.label,
        destLat: params.destination.lat,
        destLng: params.destination.lng,
        destLabel: params.destination.label,
        departureTime: params.departureTime,
        options: {
          create: filteredOptions.map((option) => {
            const mode = transportModes.find((m) => m.code === option.transportModeCode)!;
            return {
              transportMode: { connect: { id: mode.id } },
              durationMinutes: option.durationMinutes,
              distanceKm: option.distanceKm,
              estimatedCost: option.estimatedCost,
              estimatedCo2Grams: option.estimatedCo2Grams,
              walkingMinutes: option.walkingMinutes,
              reliabilityScore: option.reliabilityScore,
              compositeScore: option.compositeScore,
              isRecommended: option.isRecommended,
              metadata: toJsonMetadata({
                scores: option.scores,
                weightsUsed: weights,
                ...option.metadata,
              }),
            };
          }),
        },
      },
      include: {
        options: {
          include: { transportMode: true },
          orderBy: { compositeScore: 'desc' },
        },
      },
    });

    return {
      route: formatSavedRoute(savedRoute),
      options: savedRoute.options.map(formatSavedOption),
      recommendedOptionId: savedRoute.options.find((o) => o.isRecommended)?.id ?? null,
      weightsUsed: weights,
      disclaimer: searchResult.disclaimer,
      straightLineKm: searchResult.distanceKm,
    };
  },

  async rankRoutes(routeId: string, userId: string, weights: ScoringWeights) {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        options: { include: { transportMode: true } },
      },
    });

    if (!route) {
      throw new NotFoundError('Route not found');
    }

    const preferences = await prisma.userPreference.findUnique({ where: { userId } });

    const rankable = route.options.map((option) => {
      const metrics = sustainabilityEngine.calculateMetrics({
        distanceKm: option.distanceKm,
        co2GramsPerKm: option.transportMode.co2GramsPerKm,
        avgCostPerKm: option.transportMode.avgCostPerKm,
        baseFare: getBaseFare(option.transportMode.code),
      });

      return {
        id: option.id,
        transportModeCode: option.transportMode.code,
        transportModeName: option.transportMode.name,
        durationMinutes: option.durationMinutes,
        distanceKm: option.distanceKm,
        estimatedCost: metrics.estimatedCost,
        estimatedCo2Grams: metrics.estimatedCo2Grams,
        walkingMinutes: option.walkingMinutes,
        reliabilityScore: option.reliabilityScore,
        metadata: (option.metadata as Record<string, unknown>) ?? {},
      };
    });

    const maxWalkingMinutes = preferences?.maxWalkingDistanceM
      ? Math.ceil(preferences.maxWalkingDistanceM / 80)
      : null;

    let ranked = rankRouteOptions(
      rankable.map(({ id: _id, ...rest }) => rest),
      weights,
    );

    ranked = applyConstraints(ranked, {
      maxBudget: preferences?.maxBudget,
      maxWalkingMinutes,
    });

    await Promise.all(
      ranked.map((option) => {
        const original = rankable.find((r) => r.transportModeCode === option.transportModeCode);
        if (!original) return Promise.resolve();

        return prisma.routeOption.update({
          where: { id: original.id },
          data: {
            compositeScore: option.compositeScore,
            isRecommended: option.isRecommended,
            estimatedCost: option.estimatedCost,
            estimatedCo2Grams: option.estimatedCo2Grams,
            metadata: toJsonMetadata({
              scores: option.scores,
              weightsUsed: weights,
              ...option.metadata,
            }),
          },
        });
      }),
    );

    return {
      routeId,
      options: ranked.map((option) => {
        const original = rankable.find((r) => r.transportModeCode === option.transportModeCode);
        return { id: original?.id, ...option };
      }),
      weightsUsed: weights,
    };
  },

  async getRouteById(routeId: string) {
    const route = await prisma.route.findUnique({
      where: { id: routeId },
      include: {
        options: {
          include: { transportMode: true },
          orderBy: { compositeScore: 'desc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundError('Route not found');
    }

    return {
      route: formatSavedRoute(route),
      options: route.options.map(formatSavedOption),
      recommendedOptionId: route.options.find((o) => o.isRecommended)?.id ?? null,
    };
  },
};

function formatSavedRoute(route: {
  id: string;
  sourceLat: number;
  sourceLng: number;
  sourceLabel: string;
  destLat: number;
  destLng: number;
  destLabel: string;
  departureTime: Date;
  createdAt: Date;
}) {
  return {
    id: route.id,
    source: { lat: route.sourceLat, lng: route.sourceLng, label: route.sourceLabel },
    destination: { lat: route.destLat, lng: route.destLng, label: route.destLabel },
    departureTime: route.departureTime.toISOString(),
    straightLineKm: haversineDistanceKm(
      route.sourceLat,
      route.sourceLng,
      route.destLat,
      route.destLng,
    ),
    createdAt: route.createdAt.toISOString(),
  };
}

function formatSavedOption(option: {
  id: string;
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: number;
  estimatedCo2Grams: number;
  walkingMinutes: number;
  reliabilityScore: number;
  compositeScore: number | null;
  isRecommended: boolean;
  metadata: unknown;
  transportMode: TransportMode;
}) {
  const metadata = (option.metadata as Record<string, unknown>) ?? {};

  return {
    id: option.id,
    transportMode: {
      code: option.transportMode.code,
      name: option.transportMode.name,
    },
    durationMinutes: option.durationMinutes,
    distanceKm: option.distanceKm,
    estimatedCost: option.estimatedCost,
    estimatedCo2Grams: option.estimatedCo2Grams,
    walkingMinutes: option.walkingMinutes,
    reliabilityScore: option.reliabilityScore,
    compositeScore: option.compositeScore,
    isRecommended: option.isRecommended,
    scores: (metadata.scores as RankedRouteOption['scores']) ?? null,
    metadata,
  };
}

function getBaseFare(code: string): number {
  const fares: Record<string, number> = {
    BUS: 15,
    METRO: 20,
    TRAIN: 30,
    AUTO: 40,
  };
  return fares[code] ?? 0;
}
