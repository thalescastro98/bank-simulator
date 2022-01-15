import * as request from 'supertest';
import { buildApp } from '../src/app';
import { destroyConnection } from '../src/database';

describe('Basic authentication test for admin', () => {
  const app = buildApp();

  afterAll(async () => {
    await destroyConnection();
  });

  it('Successful authentication', async () => {
    const response = await request(app).get('/').auth('admin', 'admin', { type: 'basic' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Working');
  });

  describe('Failed authentication', () => {
    it('Non-existent authorization', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(401);
      expect(response.text).toBe('{"error":"Access Denied."}');
    });

    it('Wrong password', async () => {
      const response = await request(app).get('/').auth('admin', 'admi', { type: 'basic' });
      expect(response.status).toBe(401);
      expect(response.text).toBe('{"error":"Access Denied."}');
    });

    it('JoiSchema error in login', async () => {
      const response = await request(app).get('/').auth('ad', 'admi', { type: 'basic' });
      expect(response.body).toStrictEqual([
        {
          message: '"name" length must be at least 4 characters long',
          path: ['name'],
          type: 'string.min',
          context: {
            limit: 4,
            value: 'ad',
            label: 'name',
            key: 'name',
          },
        },
      ]);
      expect(response.status).toBe(400);
    });

    it('JoiSchema error in password', async () => {
      const response = await request(app).get('/').auth('admi', 'ad', { type: 'basic' });
      expect(response.body).toStrictEqual([
        {
          message: '"pass" length must be at least 4 characters long',
          path: ['pass'],
          type: 'string.min',
          context: { limit: 4, value: 'ad', label: 'pass', key: 'pass' },
        },
      ]);
      expect(response.status).toBe(400);
    });
  });
});
