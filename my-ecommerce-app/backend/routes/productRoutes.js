import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { adminProtect, requirePermission } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", adminProtect, requirePermission("products"), createProduct);
router.put("/:id", adminProtect, requirePermission("products"), updateProduct);
router.delete("/:id", adminProtect, requirePermission("products"), deleteProduct);

export default router;