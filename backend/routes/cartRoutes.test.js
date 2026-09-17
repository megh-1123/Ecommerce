import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

describe('Cart - add and remove item', () => {
  let token;
  let testProduct;
  const testUserId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    // Generate a valid JWT directly, same way login would, but without
    // needing a real user account to exist.
    token = jwt.sign({ id: testUserId.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Create a temporary product to add to the cart, deleted in afterAll.
    testProduct = await Product.create({
      name: 'TEMP TEST PRODUCT - safe to ignore',
      price: 999,
      category: 'test',
      image: 'https://example.com/test.jpg',
    });
  });

  afterAll(async () => {
    // Clean up everything this test created, so nothing real is left behind.
    await Cart.deleteOne({ user: testUserId });
    await Product.deleteOne({ _id: testProduct._id });
    await mongoose.connection.close();
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