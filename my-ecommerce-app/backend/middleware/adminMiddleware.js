import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Verifies the JWT is genuine (proves WHO the admin is), then looks up
// their CURRENT role/permissions/active-status from the database on every
// single request — so changes made by a super admin take effect immediately,
// not just after the token happens to expire or they log in again.
export const adminProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin account no longer exists" });
    }

    if (admin.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated" });
    }

    // Fresh data from the database, not from the (potentially stale) token payload
    req.admin = {
      id: admin._id,
      isAdmin: true,
      role: admin.role,
      permissions: admin.permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const superAdminOnly = (req, res, next) => {
  if (req.admin?.role !== "superadmin") {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

export const regularAdminOnly = (req, res, next) => {
  if (req.admin?.role !== "admin") {
    return res.status(403).json({ message: "Regular admin access required" });
  }
  next();
};

// Regular admins need this specific permission (looked up fresh from the database above).
// A superadmin always passes automatically.
export const requirePermission = (permission) => (req, res, next) => {
  if (req.admin?.role === "superadmin") {
    return next();
  }
  if (!req.admin?.permissions?.includes(permission)) {
    return res.status(403).json({ message: `Missing permission: ${permission}` });
  }
  next();
};