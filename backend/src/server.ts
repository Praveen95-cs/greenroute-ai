import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';

const app = createApp();

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL');

    app.listen(env.BACKEND_PORT, () => {
      console.log(`[Server] GreenRoute API running on http://localhost:${env.BACKEND_PORT}`);
      console.log(`[Server] Health check: http://localhost:${env.BACKEND_PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
