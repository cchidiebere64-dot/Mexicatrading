// routes/dashboardRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// 💰 Deposit route
router.post("/deposit", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid deposit amount" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // update balance
    user.balance += amount;

    // add to history
    user.history.push({
      action: "Deposit",
      amount: `$${amount}`,
      date: new Date().toISOString().split("T")[0],
    });

    await user.save();

    res.json({
      msg: "Deposit successful",
      balance: user.balance,
      history: user.history,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
