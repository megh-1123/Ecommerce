import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

// @route  GET /api/admin/manage
// @desc   List all admins (excluding passwords)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/admin/manage
// @desc   Create a new admin with specific permissions
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An admin with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      permissions: Array.isArray(permissions) ? permissions : [],
    });

    res.status(201).json({
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

// @route  PUT /api/admin/manage/:id
// @desc   Update an admin's permissions
export const updateAdminPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res.status(400).json({ message: "Cannot modify a super admin's permissions" });
    }

    admin.permissions = Array.isArray(permissions) ? permissions : [];
    await admin.save();

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/admin/manage/:id
// @desc   Delete an admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res.status(400).json({ message: "Cannot delete a super admin" });
    }

    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/admin/manage/:id/toggle-active
// @desc   Activate or deactivate an admin (blocks/unblocks their login, doesn't delete anything)
export const toggleAdminActive = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res.status(400).json({ message: "Cannot deactivate a super admin" });
    }

    admin.isActive = admin.isActive === false ? true : false;
    await admin.save();

    res.status(200).json({ message: `Admin ${admin.isActive ? "activated" : "deactivated"}`, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};