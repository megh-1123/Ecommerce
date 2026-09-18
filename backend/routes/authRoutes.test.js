import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

describe('POST /api/auth/login', () => {
  const testEmail = `test-login-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Create a real account the same way a real user would, via the actual
    // registration endpoint — not inserted directly into the database.
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Login User', email: testEmail, password: testPassword });
  });

  afterAll(async () => {
    // Remove the test account so nothing real is left behind.
    await User.deleteOne({ email: testEmail });
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

  it('returns 200 and a token for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(testEmail);
  });
});