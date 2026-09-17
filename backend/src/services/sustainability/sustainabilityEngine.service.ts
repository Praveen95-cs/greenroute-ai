import { round } from '../../utils/geo';
import { RouteScores, ScoringWeights } from '../../types/route.types';

export interface SustainabilityInput {
  distanceKm: number;
  co2GramsPerKm: number;
  avgCostPerKm: number;
  baseFare?: number;
}

export interface SustainabilityMetrics {
  estimatedCo2Grams: number;
  estimatedCost: number;
}

export interface CandidateMetrics {
  durationMinutes: number;
  estimatedCo2Grams: number;
  estimatedCost: number;
  walkingMinutes: number;
  reliabilityScore: number;
}

export const sustainabilityEngine = {
  calculateCo2Grams(distanceKm: number, co2GramsPerKm: number): number {
    return round(distanceKm * co2GramsPerKm, 1);
  },

  calculateCost(distanceKm: number, avgCostPerKm: number, baseFare = 0): number {
    return round(baseFare + distanceKm * avgCostPerKm, 2);
  },

  calculateMetrics(input: SustainabilityInput): SustainabilityMetrics {
    return {
      estimatedCo2Grams: this.calculateCo2Grams(input.distanceKm, input.co2GramsPerKm),
      estimatedCost: this.calculateCost(
        input.distanceKm,
        input.avgCostPerKm,
        input.baseFare ?? 0,
      ),
    };
  },

  scoreCandidates(
    candidates: CandidateMetrics[],
    weights: ScoringWeights,
  ): RouteScores[] {
    if (candidates.length === 0) return [];

    const durations = candidates.map((c) => c.durationMinutes);
    const co2Values = candidates.map((c) => c.estimatedCo2Grams);
    const costs = candidates.map((c) => c.estimatedCost);
    const walking = candidates.map((c) => c.walkingMinutes);

    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const minCo2 = Math.min(...co2Values);
    const maxCo2 = Math.max(...co2Values);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const minWalking = Math.min(...walking);
    const maxWalking = Math.max(...walking);

    return candidates.map((candidate) => {
      const time = normalizeLowerIsBetter(candidate.durationMinutes, minDuration, maxDuration);
      const carbon = normalizeLowerIsBetter(candidate.estimatedCo2Grams, minCo2, maxCo2);
      const cost = normalizeLowerIsBetter(candidate.estimatedCost, minCost, maxCost);
      const walkingScore = normalizeLowerIsBetter(
        candidate.walkingMinutes,
        minWalking,
        maxWalking,
      );
      const reliability = clampScore(candidate.reliabilityScore);

      const sustainability = round(
        weights.time * time +
          weights.cost * cost +
          weights.carbon * carbon +
          weights.reliability * reliability +
          weights.walking * walkingScore,
        4,
      );

      return {
        time: round(time, 4),
        carbon: round(carbon, 4),
        cost: round(cost, 4),
        reliability: round(reliability, 4),
        walking: round(walkingScore, 4),
        sustainability,
      };
    });
  },
};

function normalizeLowerIsBetter(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return clampScore(1 - (value - min) / (max - min));
}

function clampScore(value: number): number {
  return round(Math.min(1, Math.max(0, value)), 4);
}
