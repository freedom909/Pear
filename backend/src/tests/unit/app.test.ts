import app from '../../app';
import request from 'supertest';
import {jest,describe,it,expect} from '@jest/globals';

// Compare this snippet from backend/src/tests/unit/app.test.ts:
// import app from '../../app';
// import request from 'supertest';
// import { ErrorCode } from '../../types/ErrorCode';

describe('App Configuration', () => {
  it('should have CORS enabled', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://example.com');
    
    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });

  it('should parse JSON bodies', async () => {
    const response = await request(app)
      .post('/api/test-endpoint')
      .send({ test: 'data' });
    
    // Even if the route doesn't exist, the body parser should work
    expect(response.status).not.toBe(415); // 415 is Unsupported Media Type
  });

  it('should have security headers', async () => {
    const response = await request(app).get('/');
    
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-xss-protection']).toBeTruthy();
  });

  it('should handle 404 errors', async () => {
    const response = await request(app).get('/non-existent-route');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });
});