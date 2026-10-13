import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('GET /api/health should return OK', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('ai');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('allows configured frontend origins to make preflight requests', async () => {
    for (const origin of ['http://localhost:3000', 'https://blogcraft-ai.onrender.com']) {
      const res = await request(app)
        .options('/api/auth/register')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'content-type');

      expect(res.statusCode).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe(origin);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    }
  });
});
