import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

describe('POST /api/auth/login', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('returns 400 when email is not a valid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'somepassword' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please enter a valid email');
  });

  it('returns 401 for a well-formed but non-existent account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'this-user-does-not-exist@example.com', password: 'wrongpassword123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});