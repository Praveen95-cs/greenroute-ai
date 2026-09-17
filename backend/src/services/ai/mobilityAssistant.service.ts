import { Prisma } from '@prisma/client';
import { resolveLocation } from '../../constants/locations';
import { prisma } from '../../config/database';
import { ValidationError } from '../../utils/errors';
import { routeService } from '../route/route.service';
import { aiClient, weightsFromPriority } from './aiClient.service';

function toJsonMetadata(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export const mobilityAssistantService = {
  async processQuery(userId: string, query: string, defaultSourceLabel?: string) {
    const extraction = await aiClient.extractConstraints(query, defaultSourceLabel);
    const { constraints, ambiguities } = extraction;

    if (!constraints.destination_label) {
      throw new ValidationError(
        'Could not identify a destination. Please mention a known place such as Anna University or Chennai Central.',
        { ambiguities },
      );
    }

    const sourceLabel = constraints.source_label ?? defaultSourceLabel ?? 'Chennai Central';
    const source = resolveLocation(sourceLabel);
    const destination = resolveLocation(constraints.destination_label);

    if (!source || !destination) {
      throw new ValidationError(
        'One or more locations could not be resolved. Supported places: Chennai Central, Anna University, T Nagar, Chennai Airport, Marina Beach.',
        { sourceLabel, destinationLabel: constraints.destination_label },
      );
    }

    const departureTime = new Date();
    const arrivalDeadline = constraints.arrival_deadline
      ? new Date(constraints.arrival_deadline)
      : undefined;

    const customWeights = weightsFromPriority(constraints.priority ?? 'balanced');

    const routeResult = await routeService.searchRoutes(
      userId,
      {
        source: { lat: source.lat, lng: source.lng, label: source.label },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          label: destination.label,
        },
        departureTime,
        arrivalDeadline,
        transportModes: constraints.transport_modes ?? undefined,
      },
      customWeights,
      {
        maxBudget: constraints.budget ?? undefined,
        maxWalkingMinutes: constraints.max_walking_minutes ?? undefined,
      },
    );

    const recommended = routeResult.options.find((o) => o.isRecommended) ?? routeResult.options[0];
    const alternatives = routeResult.options.filter((o) => o.id !== recommended?.id).slice(0, 3);

    let explanation = {
      explanation: '',
      highlights: [] as string[],
      responsible_ai_note:
        'Explanation unavailable — recommendation is based on backend route calculations.',
    };

    if (recommended) {
      explanation = await aiClient.explainRecommendation({
        user_query: query,
        constraints,
        source_label: source.label,
        destination_label: destination.label,
        recommended: {
          transport_mode: recommended.transportMode.name,
          duration_minutes: recommended.durationMinutes,
          estimated_cost: recommended.estimatedCost,
          estimated_co2_grams: recommended.estimatedCo2Grams,
          walking_minutes: recommended.walkingMinutes,
          composite_score: recommended.compositeScore ?? 0,
          is_recommended: true,
        },
        alternatives: alternatives.map((a) => ({
          transport_mode: a.transportMode.name,
          duration_minutes: a.durationMinutes,
          estimated_cost: a.estimatedCost,
          estimated_co2_grams: a.estimatedCo2Grams,
          walking_minutes: a.walkingMinutes,
          composite_score: a.compositeScore ?? 0,
          is_recommended: false,
        })),
        disclaimer: routeResult.disclaimer,
      });
    }

    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        query,
        response: explanation.explanation,
        metadata: toJsonMetadata({
          constraints,
          ambiguities,
          routeId: routeResult.route.id,
          recommendedOptionId: routeResult.recommendedOptionId,
          extractionMethod: constraints.extraction_method,
        }),
      },
    });

    return {
      conversationId: conversation.id,
      constraints: {
        source: source.label,
        destination: destination.label,
        arrivalDeadline: constraints.arrival_deadline,
        budget: constraints.budget,
        maxWalkingMinutes: constraints.max_walking_minutes,
        priority: constraints.priority ?? 'balanced',
        transportModes: constraints.transport_modes,
        confidence: constraints.confidence,
        extractionMethod: constraints.extraction_method,
      },
      ambiguities,
      route: routeResult,
      explanation,
    };
  },
};
