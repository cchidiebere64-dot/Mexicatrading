import express from "express";
import { depositFunds } from "../controllers/depositController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Deposit money into user balance
router.post("/", protect, depositFunds);

export default router;
