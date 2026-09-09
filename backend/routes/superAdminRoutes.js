import express from "express";
import {
  getAllAdmins,
  createAdmin,
  updateAdminPermissions,
  deleteAdmin,
  toggleAdminActive,
} from "../controllers/superAdminController.js";
import { adminProtect, superAdminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", adminProtect, superAdminOnly, getAllAdmins);
router.post("/", adminProtect, superAdminOnly, createAdmin);
router.put("/:id", adminProtect, superAdminOnly, updateAdminPermissions);
router.put("/:id/toggle-active", adminProtect, superAdminOnly, toggleAdminActive);
router.delete("/:id", adminProtect, superAdminOnly, deleteAdmin);

export default router;