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
});
