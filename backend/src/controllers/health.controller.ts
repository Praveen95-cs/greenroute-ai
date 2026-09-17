import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { aiHealthService } from '../services/ai/aiHealth.service';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: {
      service: 'greenroute-backend',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getReadiness(_req: Request, res: Response): Promise<void> {
  const [databaseConnected, aiServiceHealthy] = await Promise.all([
    checkDatabaseConnection(),
    aiHealthService.checkHealth(),
  ]);

  const ready = databaseConnected && aiServiceHealthy;

  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      service: 'greenroute-backend',
      status: ready ? 'ready' : 'degraded',
      checks: {
        database: databaseConnected ? 'up' : 'down',
        aiService: aiServiceHealthy ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    },
  });
}
