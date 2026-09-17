import { describe, expect, it } from 'vitest';
import {
  computeCompatibility,
  findCompatibleMatches,
} from '../src/algorithms/carpool-matching/carpoolMatcher';

const baseTime = new Date('2026-08-28T09:00:00Z');

describe('Carpool Matcher', () => {
  const request = {
    id: 'req-1',
    userId: 'user-a',
    originLat: 13.0827,
    originLng: 80.2707,
    destLat: 13.0067,
    destLng: 80.2206,
    departureTime: baseTime,
    maxDetourKm: 2,
  };

  it('matches compatible users with high score', () => {
    const compatible = {
      id: 'req-2',
      userId: 'user-b',
      originLat: 13.083,
      originLng: 80.271,
      destLat: 13.007,
      destLng: 80.221,
      departureTime: new Date(baseTime.getTime() + 10 * 60_000),
      maxDetourKm: 2,
    };

    const result = computeCompatibility(request, compatible);
    expect(result).not.toBeNull();
    expect(result!.compatibilityScore).toBeGreaterThan(0.7);
  });

  it('rejects incompatible users far apart', () => {
    const incompatible = {
      id: 'req-3',
      userId: 'user-c',
      originLat: 12.9941,
      originLng: 80.1709,
      destLat: 13.05,
      destLng: 80.2824,
      departureTime: new Date(baseTime.getTime() + 120 * 60_000),
      maxDetourKm: 2,
    };

    const result = computeCompatibility(request, incompatible);
    expect(result).toBeNull();
  });

  it('rejects same user', () => {
    const result = computeCompatibility(request, { ...request, userId: 'user-a' });
    expect(result).toBeNull();
  });

  it('ranks multiple matches by compatibility', () => {
    const candidates = [
      {
        id: 'r2',
        userId: 'user-b',
        originLat: 13.083,
        originLng: 80.271,
        destLat: 13.007,
        destLng: 80.221,
        departureTime: new Date(baseTime.getTime() + 5 * 60_000),
        maxDetourKm: 2,
      },
      {
        id: 'r3',
        userId: 'user-c',
        originLat: 13.09,
        originLng: 80.28,
        destLat: 13.01,
        destLng: 80.23,
        departureTime: new Date(baseTime.getTime() + 20 * 60_000),
        maxDetourKm: 2,
      },
    ];

    const matches = findCompatibleMatches(request, candidates);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].compatibilityScore).toBeGreaterThanOrEqual(matches[matches.length - 1].compatibilityScore);
  });
});
