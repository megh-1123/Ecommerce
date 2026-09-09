import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, 
    googleId: { type: String, unique: true, sparse: true }, // sparse = allows many nulls but unique when present
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);