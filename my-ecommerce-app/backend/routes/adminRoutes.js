import express from "express";
import { adminLogin, getCurrentAdmin } from "../controllers/adminAuthController.js";
import { getAllUsers, getAllCarts, deleteUser, getAllOrders } from "../controllers/adminController.js";
import { adminProtect, requirePermission } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", adminProtect, getCurrentAdmin);

router.get("/users", adminProtect, requirePermission("users"), getAllUsers);
router.get("/carts", adminProtect, requirePermission("carts"), getAllCarts);
router.get("/orders", adminProtect, requirePermission("orders"), getAllOrders);
router.delete("/users/:id", adminProtect, requirePermission("users"), deleteUser);

export default router;