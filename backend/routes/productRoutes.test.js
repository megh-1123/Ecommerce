import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

describe('GET /api/products', () => {
  it('returns a list of products with status 200', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});