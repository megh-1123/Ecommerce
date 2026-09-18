import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

describe('Cart - add and remove item', () => {
  const testEmail = `test-cart-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let token;
  let userId;
  let testProduct;

  beforeAll(async () => {
    // Register a real test user through the real endpoint.
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Cart User', email: testEmail, password: testPassword });
    userId = registerRes.body._id;

    // Log in for real, exactly like a real user would, to get a real token.
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    token = loginRes.body.token;

    // Create a temporary product to add to the cart.
    testProduct = await Product.create({
      name: 'TEMP TEST PRODUCT - safe to ignore',
      price: 999,
      category: 'test',
      image: 'https://example.com/test.jpg',
    });
  });

  afterAll(async () => {
    // Clean up everything this test created.
    await Cart.deleteOne({ user: userId });
    await Product.deleteOne({ _id: testProduct._id });
    await User.deleteOne({ _id: userId });
    await mongoose.connection.close();
  });

  it('logged in successfully and received a real token', () => {
    expect(token).toBeDefined();
  });

  it('adds an item to the cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct._id.toString(), quantity: 2 });

    expect(res.statusCode).toBe(200);
    const addedItem = res.body.items.find(
      (item) => item.product._id === testProduct._id.toString()
    );
    expect(addedItem).toBeDefined();
    expect(addedItem.quantity).toBe(2);
  });

  it('removes the item from the cart', async () => {
    const res = await request(app)
      .delete(`/api/cart/${testProduct._id.toString()}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const stillThere = res.body.items.find(
      (item) => item.product && item.product._id === testProduct._id.toString()
    );
    expect(stillThere).toBeUndefined();
  });
});