import { CarpoolStatus } from '@prisma/client';
import { findCompatibleMatches } from '../../algorithms/carpool-matching/carpoolMatcher';
import { prisma } from '../../config/database';
import { ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { CarpoolRequestInput } from '../../validators/carpool.validator';

export const carpoolService = {
  async createRequest(userId: string, input: CarpoolRequestInput) {
    const request = await prisma.carpoolRequest.create({
      data: {
        userId,
        originLat: input.origin.lat,
        originLng: input.origin.lng,
        originLabel: input.origin.label,
        destLat: input.destination.lat,
        destLng: input.destination.lng,
        destLabel: input.destination.label,
        departureTime: input.departureTime,
        availableSeats: input.availableSeats,
        maxDetourKm: input.maxDetourKm,
        status: CarpoolStatus.PENDING,
      },
    });

    const candidates = await prisma.carpoolRequest.findMany({
      where: {
        status: CarpoolStatus.PENDING,
        userId: { not: userId },
      },
    });

    const matches = findCompatibleMatches(
      {
        id: request.id,
        userId: request.userId,
        originLat: request.originLat,
        originLng: request.originLng,
        destLat: request.destLat,
        destLng: request.destLng,
        departureTime: request.departureTime,
        maxDetourKm: request.maxDetourKm,
      },
      candidates.map((c) => ({
        id: c.id,
        userId: c.userId,
        originLat: c.originLat,
        originLng: c.originLng,
        destLat: c.destLat,
        destLng: c.destLng,
        departureTime: c.departureTime,
        maxDetourKm: c.maxDetourKm,
      })),
    );

    const savedMatches = await Promise.all(
      matches.map((m) =>
        prisma.carpoolMatch.create({
          data: {
            requestId: request.id,
            matchedUserId: m.matchedUserId,
            compatibilityScore: m.compatibilityScore,
            detourKm: m.detourKm,
            status: CarpoolStatus.MATCHED,
          },
        }),
      ),
    );

    if (savedMatches.length > 0) {
      await prisma.carpoolRequest.update({
        where: { id: request.id },
        data: { status: CarpoolStatus.MATCHED },
      });
    }

    return {
      request: formatRequest(request),
      matches: await getMatchesForRequest(request.id),
      matchCount: savedMatches.length,
    };
  },

  async getMatches(userId: string) {
    const ownRequests = await prisma.carpoolRequest.findMany({
      where: { userId },
      select: { id: true },
    });

    const requestIds = ownRequests.map((r) => r.id);

    const matches = await prisma.carpoolMatch.findMany({
      where: {
        OR: [{ requestId: { in: requestIds } }, { matchedUserId: userId }],
      },
      include: {
        request: true,
        matchedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { compatibilityScore: 'desc' },
    });

    return matches.map((m) => ({
      id: m.id,
      compatibilityScore: m.compatibilityScore,
      detourKm: m.detourKm,
      status: m.status,
      request: formatRequest(m.request),
      matchedUser: m.matchedUser,
    }));
  },

  async acceptMatch(matchId: string, userId: string) {
    const match = await prisma.carpoolMatch.findUnique({
      where: { id: matchId },
      include: { request: true },
    });

    if (!match) {
      throw new NotFoundError('Carpool match not found');
    }

    const isOwner = match.request.userId === userId;
    const isMatched = match.matchedUserId === userId;

    if (!isOwner && !isMatched) {
      throw new ForbiddenError('You are not part of this carpool match');
    }

    if (match.status === CarpoolStatus.ACCEPTED) {
      throw new ConflictError('Match already accepted');
    }

    const updated = await prisma.carpoolMatch.update({
      where: { id: matchId },
      data: { status: CarpoolStatus.ACCEPTED },
    });

    await prisma.carpoolRequest.update({
      where: { id: match.requestId },
      data: { status: CarpoolStatus.ACCEPTED },
    });

    return updated;
  },
};

async function getMatchesForRequest(requestId: string) {
  const matches = await prisma.carpoolMatch.findMany({
    where: { requestId },
    include: {
      matchedUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { compatibilityScore: 'desc' },
  });

  return matches.map((m) => ({
    id: m.id,
    compatibilityScore: m.compatibilityScore,
    detourKm: m.detourKm,
    status: m.status,
    matchedUser: m.matchedUser,
  }));
}

function formatRequest(request: {
  id: string;
  originLat: number;
  originLng: number;
  originLabel: string;
  destLat: number;
  destLng: number;
  destLabel: string;
  departureTime: Date;
  availableSeats: number;
  maxDetourKm: number;
  status: CarpoolStatus;
  createdAt: Date;
}) {
  return {
    id: request.id,
    origin: {
      lat: request.originLat,
      lng: request.originLng,
      label: request.originLabel,
    },
    destination: {
      lat: request.destLat,
      lng: request.destLng,
      label: request.destLabel,
    },
    departureTime: request.departureTime.toISOString(),
    availableSeats: request.availableSeats,
    maxDetourKm: request.maxDetourKm,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  };
}
