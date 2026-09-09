import express from "express";
import { getWishlist, toggleWishlistItem, clearWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/:productId", protect, toggleWishlistItem);
router.delete("/", protect, clearWishlist);

export default router;