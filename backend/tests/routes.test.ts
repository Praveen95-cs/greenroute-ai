import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const testEmail = `route-test-${Date.now()}@greenroute.test`;
const testPassword = 'TestPass123';
let accessToken = '';
let routeId = '';

const chennaiCentral = { lat: 13.0827, lng: 80.2707, label: 'Chennai Central' };
const annaUniversity = { lat: 13.0067, lng: 80.2206, label: 'Anna University' };

describe('Route Planning API', () => {
  beforeAll(async () => {
    await prisma.$connect();

    const register = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: testPassword,
      firstName: 'Route',
      lastName: 'Tester',
    });

    accessToken = register.body.data.tokens.accessToken;
  });

  it('POST /api/v1/routes/search — returns scored route options', async () => {
    const response = await request(app)
      .post('/api/v1/routes/search')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        source: chennaiCentral,
        destination: annaUniversity,
        departureTime: new Date().toISOString(),
        transportModes: ['BUS', 'METRO', 'CAR', 'WALK'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.options.length).toBeGreaterThan(0);
    expect(response.body.data.recommendedOptionId).toBeDefined();
    expect(response.body.data.disclaimer).toContain('estimates');

    const recommended = response.body.data.options.find(
      (o: { isRecommended: boolean }) => o.isRecommended,
    );
    expect(recommended.scores.sustainability).toBeGreaterThan(0);
    expect(recommended.estimatedCo2Grams).toBeGreaterThanOrEqual(0);

    routeId = response.body.data.route.id;
  });

  it('GET /api/v1/routes/:id — returns saved route', async () => {
    const response = await request(app)
      .get(`/api/v1/routes/${routeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.route.source.label).toBe('Chennai Central');
    expect(response.body.data.options.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/routes/:id/rank — re-ranks with custom weights', async () => {
    const response = await request(app)
      .post(`/api/v1/routes/${routeId}/rank`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        weights: { time: 0.6, cost: 0.1, carbon: 0.1, reliability: 0.1, walking: 0.1 },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.options[0].isRecommended).toBe(true);
  });

  it('POST /api/v1/routes/search — requires authentication', async () => {
    const response = await request(app).post('/api/v1/routes/search').send({
      source: chennaiCentral,
      destination: annaUniversity,
      departureTime: new Date().toISOString(),
    });

    expect(response.status).toBe(401);
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});
