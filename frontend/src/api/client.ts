import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.error?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export interface HealthResponse {
  success: boolean;
  data: {
    service: string;
    status: string;
    timestamp: string;
  };
}

export interface ReadinessResponse {
  success: boolean;
  data: {
    service: string;
    status: string;
    checks: {
      database: string;
      aiService: string;
    };
    timestamp: string;
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/api/v1/health');
  return data;
}

export async function fetchReadiness(): Promise<ReadinessResponse> {
  const { data } = await apiClient.get<ReadinessResponse>('/api/v1/health/ready');
  return data;
}
