export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredTransport: string | null;
  maxWalkingDistanceM: number | null;
  maxBudget: number | null;
  sustainabilityPriority: number;
  timePriority: number;
  accessibilityNeeds: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
}

export interface UpdatePreferencesInput {
  preferredTransport?: string | null;
  maxWalkingDistanceM?: number | null;
  maxBudget?: number | null;
  sustainabilityPriority?: number;
  timePriority?: number;
  accessibilityNeeds?: Record<string, unknown> | null;
}
