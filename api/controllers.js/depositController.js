import User from "../models/User.js";

export const depositFunds = async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit amount" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance += amount;
    await user.save();

    res.json({
      message: "Deposit successful",
      balance: user.balance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
