import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Super admin already exists for ${email}. Nothing to do.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const superAdmin = await Admin.create({
    name: "Super Admin",
    email,
    password: hashedPassword,
    role: "superadmin",
    permissions: [], // superadmin doesn't need explicit permissions, has full access always
  });

  console.log(`Super admin created: ${superAdmin.email}`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to create super admin:", err);
  process.exit(1);
});