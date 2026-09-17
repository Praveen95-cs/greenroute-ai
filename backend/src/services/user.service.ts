import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { UpdatePreferencesInput, UpdateProfileInput } from '../validators/user.validator';

function mapPreferencesInput(input: UpdatePreferencesInput): Prisma.UserPreferenceUncheckedUpdateInput {
  const data: Prisma.UserPreferenceUncheckedUpdateInput = {};

  if (input.preferredTransport !== undefined) data.preferredTransport = input.preferredTransport;
  if (input.maxWalkingDistanceM !== undefined) data.maxWalkingDistanceM = input.maxWalkingDistanceM;
  if (input.maxBudget !== undefined) data.maxBudget = input.maxBudget;
  if (input.sustainabilityPriority !== undefined) {
    data.sustainabilityPriority = input.sustainabilityPriority;
  }
  if (input.timePriority !== undefined) data.timePriority = input.timePriority;
  if (input.accessibilityNeeds !== undefined) {
    data.accessibilityNeeds =
      input.accessibilityNeeds === null
        ? Prisma.JsonNull
        : (input.accessibilityNeeds as Prisma.InputJsonValue);
  }

  return data;
}

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async getPreferences(userId: string) {
    let preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: { userId },
      });
    }

    return preferences;
  },

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    const updateData = mapPreferencesInput(input);

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredTransport: input.preferredTransport ?? null,
        maxWalkingDistanceM: input.maxWalkingDistanceM ?? null,
        maxBudget: input.maxBudget ?? null,
        sustainabilityPriority: input.sustainabilityPriority ?? 50,
        timePriority: input.timePriority ?? 50,
      },
      update: updateData,
    });

    return preferences;
  },
};
