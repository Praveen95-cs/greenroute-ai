import {
  DEFAULT_SCORING_WEIGHTS,
  RankedRouteOption,
  ScoringWeights,
} from '../../types/route.types';
import { sustainabilityEngine } from '../../services/sustainability/sustainabilityEngine.service';

interface RankableOption {
  transportModeCode: string;
  transportModeName: string;
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: number;
  estimatedCo2Grams: number;
  walkingMinutes: number;
  reliabilityScore: number;
  metadata: Record<string, unknown>;
}

export function deriveWeightsFromPreferences(prefs?: {
  sustainabilityPriority: number;
  timePriority: number;
  maxBudget?: number | null;
  maxWalkingDistanceM?: number | null;
}): ScoringWeights {
  if (!prefs) return DEFAULT_SCORING_WEIGHTS;

  const sustainabilityBoost = prefs.sustainabilityPriority / 100;
  const timeBoost = prefs.timePriority / 100;

  const raw: ScoringWeights = {
    carbon: 0.2 + sustainabilityBoost * 0.25,
    time: 0.15 + timeBoost * 0.25,
    cost: prefs.maxBudget != null ? 0.25 : 0.15,
    reliability: 0.12,
    walking: prefs.maxWalkingDistanceM != null ? 0.18 : 0.1,
  };

  return normalizeWeights(raw);
}

export function rankRouteOptions(
  options: RankableOption[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): RankedRouteOption[] {
  if (options.length === 0) return [];

  const candidateMetrics = options.map((o) => ({
    durationMinutes: o.durationMinutes,
    estimatedCo2Grams: o.estimatedCo2Grams,
    estimatedCost: o.estimatedCost,
    walkingMinutes: o.walkingMinutes,
    reliabilityScore: o.reliabilityScore,
  }));

  const scores = sustainabilityEngine.scoreCandidates(candidateMetrics, weights);

  const ranked = options.map((option, index) => ({
    ...option,
    scores: scores[index],
    compositeScore: scores[index].sustainability,
    isRecommended: false,
  }));

  ranked.sort((a, b) => b.compositeScore - a.compositeScore);

  if (ranked.length > 0) {
    ranked[0].isRecommended = true;
  }

  return ranked;
}

export function normalizeWeights(weights: ScoringWeights): ScoringWeights {
  const total = weights.time + weights.cost + weights.carbon + weights.reliability + weights.walking;
  if (total === 0) return DEFAULT_SCORING_WEIGHTS;

  return {
    time: weights.time / total,
    cost: weights.cost / total,
    carbon: weights.carbon / total,
    reliability: weights.reliability / total,
    walking: weights.walking / total,
  };
}

export function applyConstraints(
  options: RankedRouteOption[],
  constraints?: {
    maxBudget?: number | null;
    maxWalkingMinutes?: number | null;
  },
): RankedRouteOption[] {
  if (!constraints) return options;

  return options.filter((option) => {
    if (constraints.maxBudget != null && option.estimatedCost > constraints.maxBudget) {
      return false;
    }
    if (
      constraints.maxWalkingMinutes != null &&
      option.walkingMinutes > constraints.maxWalkingMinutes
    ) {
      return false;
    }
    return true;
  });
}
