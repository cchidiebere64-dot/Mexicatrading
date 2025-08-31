import express from "express";
import { createInvestment, getUserInvestments } from "../controllers/investmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInvestment);
router.get("/", protect, getUserInvestments);

export default router;
