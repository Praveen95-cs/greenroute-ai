import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/database';

const app = createApp();
const userA = `carpool-a-${Date.now()}@greenroute.test`;
const userB = `carpool-b-${Date.now()}@greenroute.test`;
const password = 'TestPass123';
let tokenA = '';
let tokenB = '';
let matchId = '';

const trip = {
  origin: { lat: 13.0827, lng: 80.2707, label: 'Chennai Central' },
  destination: { lat: 13.0067, lng: 80.2206, label: 'Anna University' },
  departureTime: new Date(Date.now() + 3600000).toISOString(),
  availableSeats: 2,
  maxDetourKm: 3,
};

describe('Carpool API', () => {
  beforeAll(async () => {
    await prisma.$connect();

    const regA = await request(app).post('/api/v1/auth/register').send({
      email: userA,
      password,
      firstName: 'Alice',
      lastName: 'Driver',
    });
    tokenA = regA.body.data.tokens.accessToken;

    const regB = await request(app).post('/api/v1/auth/register').send({
      email: userB,
      password,
      firstName: 'Bob',
      lastName: 'Rider',
    });
    tokenB = regB.body.data.tokens.accessToken;
  });

  it('POST /api/v1/carpool/request — creates request', async () => {
    const response = await request(app)
      .post('/api/v1/carpool/request')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(trip);

    expect(response.status).toBe(201);
    expect(response.body.data.request.status).toBe('PENDING');
  });

  it('POST /api/v1/carpool/request — finds match for similar trip', async () => {
    const response = await request(app)
      .post('/api/v1/carpool/request')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        ...trip,
        departureTime: new Date(Date.now() + 3660000).toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body.data.matchCount).toBeGreaterThan(0);
    matchId = response.body.data.matches[0].id;
  });

  it('GET /api/v1/carpool/matches — lists matches', async () => {
    const response = await request(app)
      .get('/api/v1/carpool/matches')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(response.status).toBe(200);
    expect(response.body.data.matches.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/carpool/:id/accept — accepts match', async () => {
    const response = await request(app)
      .post(`/api/v1/carpool/${matchId}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(response.status).toBe(200);
    expect(response.body.data.match.status).toBe('ACCEPTED');
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [userA, userB] } } });
  await prisma.$disconnect();
});
