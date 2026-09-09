import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// @route  POST /api/admin/login
// @desc   Check admin credentials against the Admin collection, issue a JWT with role + permissions
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        isAdmin: true,
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/admin/me
// @desc   Return the CURRENT admin data from the database (not from the token),
//         so the frontend can refresh role/permissions on page load without
//         requiring a full re-login.
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};