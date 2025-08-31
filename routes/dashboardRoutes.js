import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get dashboard data
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      name: user.name,
      balance: user.balance,
      plans: user.plans,
      profits: user.profits,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Deposit endpoint
router.post("/deposit", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    res.json({ message: "Deposit successful", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

