import express from "express";
import User from "../models/User.js";
import Investment from "../models/Investment.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // get user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // get investments
    const investments = await Investment.find({ user: userId }).populate("plan");

    // calculate totals
    const activePlans = investments.filter((inv) => inv.status === "active");
    const totalProfit = investments.reduce((acc, inv) => acc + inv.profit, 0);

    res.json({
      name: user.name,
      balance: user.balance,
      activePlans,
      totalProfit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

