import express from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { registerValidation, loginValidation } from "../middleware/validators.js";

const router = express.Router();

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logoutUser);

export default router;