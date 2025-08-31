import Investment from "../models/Investment.js";
import User from "../models/User.js";

export const createInvestment = async (req, res) => {
  try {
    const { plan, amount } = req.body;
    if (!plan || !amount) return res.status(400).json({ msg: "Plan & amount required" });

    const investment = await Investment.create({
      user: req.user._id,
      plan,
      amount,
      profit: amount * 0.25, // Example: 25% profit
    });

    // Update user balance (subtract investment)
    await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount } });

    res.json(investment);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
