import express from "express";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getPlans);
router.get("/:id", getPlanById);

// Admin only (you can extend protect with role check)
router.post("/", protect, createPlan);
router.put("/:id", protect, updatePlan);
router.delete("/:id", protect, deletePlan);

export default router;
