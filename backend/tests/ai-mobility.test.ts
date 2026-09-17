import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { prisma } from '../src/config/database';

const app = createApp();
const testEmail = `ai-test-${Date.now()}@greenroute.test`;
const password = 'TestPass123';
let accessToken = '';
let aiAvailable = false;

describe('AI Mobility API', () => {
  beforeAll(async () => {
    await prisma.$connect();

    try {
      const health = await fetch(`${env.AI_SERVICE_URL}/health`);
      aiAvailable = health.ok;
    } catch {
      aiAvailable = false;
    }

    const reg = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password,
      firstName: 'AI',
      lastName: 'Tester',
    });
    accessToken = reg.body.data.tokens.accessToken;
  });

  it('POST /api/v1/ai/mobility-query — extracts constraints and returns routes', async () => {
    if (!aiAvailable) {
      console.warn('Skipping: AI service not available');
      return;
    }

    const response = await request(app)
      .post('/api/v1/ai/mobility-query')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query:
          "I need to reach Anna University before 9 AM. I have a budget of 100 rupees and don't want to walk more than 10 minutes.",
        defaultSourceLabel: 'Chennai Central',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.constraints.destination).toBe('Anna University');
    expect(response.body.data.route.options.length).toBeGreaterThan(0);
    expect(response.body.data.explanation.explanation.length).toBeGreaterThan(0);
    expect(response.body.data.explanation.responsible_ai_note).toContain('estimates');
  });

  it('POST /api/v1/ai/mobility-query — requires auth', async () => {
    const response = await request(app)
      .post('/api/v1/ai/mobility-query')
      .send({ query: 'Go to Anna University' });

    expect(response.status).toBe(401);
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});
