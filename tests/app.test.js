const request = require('supertest');
const app = require('../app');

describe('API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/info returns container details', async () => {
    const res = await request(app).get('/api/info');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('nodeVersion');
    expect(res.body).toHaveProperty('uptimeSeconds');
  });

  test('POST /api/visit increments counter', async () => {
    const a = await request(app).post('/api/visit');
    const b = await request(app).post('/api/visit');
    expect(b.body.visitors).toBe(a.body.visitors + 1);
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/nope');
    expect(res.statusCode).toBe(404);
  });
});
