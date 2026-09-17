import type { RouteOption } from './route';

export interface ExtractedConstraints {
  source: string;
  destination: string;
  arrivalDeadline: string | null;
  budget: number | null;
  maxWalkingMinutes: number | null;
  priority: string;
  transportModes: string[] | null;
  confidence: number;
  extractionMethod: string;
}

export interface MobilityQueryResponse {
  success: boolean;
  data: {
    conversationId: string;
    constraints: ExtractedConstraints;
    ambiguities: string[];
    route: {
      route: { id: string };
      options: RouteOption[];
      recommendedOptionId: string | null;
      disclaimer: string;
    };
    explanation: {
      explanation: string;
      highlights: string[];
      responsible_ai_note: string;
    };
  };
}
