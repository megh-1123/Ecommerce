import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  { name: "Apple AirPods Max", price: 45900, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp" },
  { name: "Beats Flex Wireless Earphones", price: 4999, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp" },
  { name: "Apple MagSafe Battery Pack", price: 8499, category: "Accessories", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp" },
  { name: "Apple iPhone Charger", price: 1699, category: "Accessories", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp" },
  { name: "Selfie Stick Monopod", price: 999, category: "Accessories", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp" },
  { name: "Selfie Lamp", price: 1299, category: "Accessories", image: "https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp" },
  { name: "iPhone 13 Pro", price: 119900, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp" },
  { name: "Samsung Galaxy S10", price: 54999, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp" },
  { name: "Realme XT", price: 24999, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp" },
  { name: "Vivo V9", price: 21999, category: "Electronics", image: "https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp" },
];

const run = async () => {
  await connectDB();
  await Product.deleteMany({});
  const created = await Product.insertMany(products);
  console.log(`Seeded ${created.length} products.`);
  await mongoose.connection.close();
   
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
   
  process.exit(1);
});