import { env } from '../../config/env';

interface AiHealthResponse {
  status: string;
  service: string;
}

export const aiHealthService = {
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${env.AI_SERVICE_URL}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as AiHealthResponse;
      return data.status === 'healthy';
    } catch {
      return false;
    }
  },
};
