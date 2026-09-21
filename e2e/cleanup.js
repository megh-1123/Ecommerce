require('dotenv').config();
const mongoose = require('mongoose');

(async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Find all test users created by E2E runs
  const testUsers = await db.collection('users').find({ email: /^e2e-test-/ }).toArray();
  const testUserIds = testUsers.map((u) => u._id);

  // Delete their carts specifically (never touch real users' carts)
  const cartResult = await db.collection('carts').deleteMany({ user: { $in: testUserIds } });

  // Delete the test users themselves
  const userResult = await db.collection('users').deleteMany({ email: /^e2e-test-/ });

  console.log(`Deleted ${userResult.deletedCount} test user(s) and ${cartResult.deletedCount} test cart(s)`);
  await mongoose.connection.close();
})();