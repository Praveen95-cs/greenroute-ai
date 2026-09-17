import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const testEmail = `test-${Date.now()}@greenroute.test`;
const testPassword = 'TestPass123';
let accessToken = '';

describe('Auth API', () => {
  it('POST /api/v1/auth/register — creates user with default preferences', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testEmail);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    accessToken = response.body.data.tokens.accessToken;
  });

  it('POST /api/v1/auth/register — rejects duplicate email', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('POST /api/v1/auth/login — authenticates valid credentials', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.tokens.accessToken).toBeDefined();
    accessToken = response.body.data.tokens.accessToken;
  });

  it('POST /api/v1/auth/login — rejects invalid password', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });

  it('GET /api/v1/auth/me — requires authentication', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('GET /api/v1/auth/me — returns current user', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(testEmail);
  });
});

describe('User Preferences API', () => {
  it('GET /api/v1/users/preferences — returns default preferences', async () => {
    const response = await request(app)
      .get('/api/v1/users/preferences')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.preferences.sustainabilityPriority).toBe(50);
  });

  it('PATCH /api/v1/users/preferences — updates preferences', async () => {
    const response = await request(app)
      .patch('/api/v1/users/preferences')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        preferredTransport: 'METRO',
        maxWalkingDistanceM: 600,
        maxBudget: 100,
        sustainabilityPriority: 80,
        timePriority: 40,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.preferences.preferredTransport).toBe('METRO');
    expect(response.body.data.preferences.maxBudget).toBe(100);
  });

  it('GET /api/v1/users/profile — returns profile', async () => {
    const response = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.profile.firstName).toBe('Test');
  });

  it('PATCH /api/v1/users/profile — updates profile', async () => {
    const response = await request(app)
      .patch('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated' });

    expect(response.status).toBe(200);
    expect(response.body.data.profile.firstName).toBe('Updated');
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

beforeAll(async () => {
  await prisma.$connect();
});
