import { env } from '../../config/env';
import { ScoringWeights } from '../../types/route.types';

export interface ExtractedConstraints {
  source_label: string | null;
  destination_label: string | null;
  arrival_deadline: string | null;
  budget: number | null;
  max_walking_minutes: number | null;
  priority: string | null;
  transport_modes: string[] | null;
  confidence: number;
  extraction_method: string;
}

export interface ConstraintExtractionResult {
  constraints: ExtractedConstraints;
  ambiguities: string[];
}

export interface RouteFact {
  transport_mode: string;
  duration_minutes: number;
  estimated_cost: number;
  estimated_co2_grams: number;
  walking_minutes: number;
  composite_score: number;
  is_recommended: boolean;
}

export interface ExplanationResult {
  explanation: string;
  highlights: string[];
  responsible_ai_note: string;
}

export const aiClient = {
  async extractConstraints(
    query: string,
    defaultSourceLabel?: string,
  ): Promise<ConstraintExtractionResult> {
    const response = await fetch(`${env.AI_SERVICE_URL}/mobility/extract-constraints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, default_source_label: defaultSourceLabel }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error('AI constraint extraction failed');
    }

    return response.json() as Promise<ConstraintExtractionResult>;
  },

  async explainRecommendation(payload: {
    user_query: string;
    constraints: ExtractedConstraints;
    source_label: string;
    destination_label: string;
    recommended: RouteFact;
    alternatives: RouteFact[];
    disclaimer: string;
  }): Promise<ExplanationResult> {
    const response = await fetch(`${env.AI_SERVICE_URL}/mobility/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error('AI explanation generation failed');
    }

    return response.json() as Promise<ExplanationResult>;
  },
};

export function weightsFromPriority(priority: string | null): ScoringWeights | undefined {
  if (!priority) return undefined;

  const map: Record<string, ScoringWeights> = {
    sustainability: { time: 0.15, cost: 0.15, carbon: 0.45, reliability: 0.15, walking: 0.1 },
    time: { time: 0.45, cost: 0.15, carbon: 0.15, reliability: 0.15, walking: 0.1 },
    cost: { time: 0.15, cost: 0.45, carbon: 0.15, reliability: 0.15, walking: 0.1 },
    balanced: { time: 0.25, cost: 0.2, carbon: 0.3, reliability: 0.15, walking: 0.1 },
  };

  return map[priority] ?? map.balanced;
}
