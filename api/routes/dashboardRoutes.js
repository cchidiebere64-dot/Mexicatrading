import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js"; // to check token

const router = express.Router();

// ✅ Get user dashboard
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      name: user.name,
      balance: user.balance,
      plans: user.plans,
      history: user.history,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;

