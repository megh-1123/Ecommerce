import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin",
    },
    // Only relevant for role: "admin" — superadmin implicitly has access to everything,
    // regardless of what's in this array.
    permissions: {
      type: [String],
      enum: ["products", "users", "carts", "orders"],
      default: [],
    },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // super admin can deactivate without deleting
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);