import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage } from "../controllers/uploadController.js";
import { adminProtect } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", adminProtect, upload.single("image"), uploadImage);

export default router;