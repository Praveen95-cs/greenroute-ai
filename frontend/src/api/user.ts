import { apiClient } from './client';
import type {
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferences,
  UserProfile,
} from '../types/user';

interface ProfileResponse {
  success: boolean;
  data: { profile: UserProfile };
}

interface PreferencesResponse {
  success: boolean;
  data: { preferences: UserPreferences };
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<ProfileResponse>('/api/v1/users/profile');
  return data.data.profile;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const { data } = await apiClient.patch<ProfileResponse>('/api/v1/users/profile', input);
  return data.data.profile;
}

export async function getPreferences(): Promise<UserPreferences> {
  const { data } = await apiClient.get<PreferencesResponse>('/api/v1/users/preferences');
  return data.data.preferences;
}

export async function updatePreferences(input: UpdatePreferencesInput): Promise<UserPreferences> {
  const { data } = await apiClient.patch<PreferencesResponse>(
    '/api/v1/users/preferences',
    input,
  );
  return data.data.preferences;
}
