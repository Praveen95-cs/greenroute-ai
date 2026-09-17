import { describe, expect, it } from 'vitest';
import { rankRouteOptions, normalizeWeights } from '../src/algorithms/route-ranking/routeRanker';
import { sustainabilityEngine } from '../src/services/sustainability/sustainabilityEngine.service';
import { haversineDistanceKm, normalizeScore } from '../src/utils/geo';

describe('Sustainability Engine', () => {
  it('calculates CO2 deterministically', () => {
    expect(sustainabilityEngine.calculateCo2Grams(10, 89)).toBe(890);
    expect(sustainabilityEngine.calculateCo2Grams(5, 0)).toBe(0);
  });

  it('calculates cost with base fare', () => {
    expect(sustainabilityEngine.calculateCost(10, 2.5, 15)).toBe(40);
    expect(sustainabilityEngine.calculateCost(10, 8, 0)).toBe(80);
  });

  it('normalizes scores — lower values score higher', () => {
    const candidates = [
      {
        durationMinutes: 30,
        estimatedCo2Grams: 500,
        estimatedCost: 50,
        walkingMinutes: 10,
        reliabilityScore: 0.8,
      },
      {
        durationMinutes: 60,
        estimatedCo2Grams: 100,
        estimatedCost: 20,
        walkingMinutes: 5,
        reliabilityScore: 0.9,
      },
    ];

    const scores = sustainabilityEngine.scoreCandidates(candidates, {
      time: 0.25,
      cost: 0.2,
      carbon: 0.3,
      reliability: 0.15,
      walking: 0.1,
    });

    expect(scores[0].time).toBe(1);
    expect(scores[1].time).toBe(0);
    expect(scores[1].carbon).toBe(1);
    expect(scores[0].carbon).toBe(0);
  });
});

describe('Route Ranking', () => {
  it('ranks lower-carbon option higher with carbon weight', () => {
    const options = rankRouteOptions(
      [
        {
          transportModeCode: 'CAR',
          transportModeName: 'Car',
          durationMinutes: 25,
          distanceKm: 10,
          estimatedCost: 80,
          estimatedCo2Grams: 1920,
          walkingMinutes: 3,
          reliabilityScore: 0.82,
          metadata: {},
        },
        {
          transportModeCode: 'METRO',
          transportModeName: 'Metro',
          durationMinutes: 35,
          distanceKm: 12,
          estimatedCost: 50,
          estimatedCo2Grams: 492,
          walkingMinutes: 8,
          reliabilityScore: 0.88,
          metadata: {},
        },
      ],
      normalizeWeights({
        time: 0.1,
        cost: 0.1,
        carbon: 0.6,
        reliability: 0.1,
        walking: 0.1,
      }),
    );

    expect(options[0].transportModeCode).toBe('METRO');
    expect(options[0].isRecommended).toBe(true);
  });

  it('changes recommendation when time weight increases', () => {
    const base = [
      {
        transportModeCode: 'CAR',
        transportModeName: 'Car',
        durationMinutes: 20,
        distanceKm: 10,
        estimatedCost: 80,
        estimatedCo2Grams: 1920,
        walkingMinutes: 3,
        reliabilityScore: 0.82,
        metadata: {},
      },
      {
        transportModeCode: 'BUS',
        transportModeName: 'Bus',
        durationMinutes: 40,
        distanceKm: 13,
        estimatedCost: 47.5,
        estimatedCo2Grams: 1157,
        walkingMinutes: 10,
        reliabilityScore: 0.72,
        metadata: {},
      },
    ];

    const timeFocused = rankRouteOptions(
      base,
      normalizeWeights({ time: 0.7, cost: 0.1, carbon: 0.1, reliability: 0.05, walking: 0.05 }),
    );

    expect(timeFocused[0].transportModeCode).toBe('CAR');
  });
});

describe('Geo utilities', () => {
  it('computes haversine distance', () => {
    const distance = haversineDistanceKm(13.0827, 80.2707, 13.0067, 80.2206);
    expect(distance).toBeGreaterThan(8);
    expect(distance).toBeLessThan(12);
  });

  it('normalizeScore returns 1 when all values equal', () => {
    expect(normalizeScore(5, 5, 5)).toBe(1);
  });
});
