// routes/adminWalletRoutes.js
import express from "express";
import Wallet from "../models/Wallet.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all wallets (for admin view)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const wallets = await Wallet.find();
    res.json(wallets);
  } catch (error) {
    console.error("❌ Fetch wallets error:", error);
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

// ✅ Add a new wallet
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, address, caution } = req.body;
    if (!name || !address) return res.status(400).json({ message: "Name and address are required" });

    const existing = await Wallet.findOne({ name });
    if (existing) return res.status(400).json({ message: "Wallet already exists" });

    const wallet = await Wallet.create({ name, address, caution });
    res.status(201).json({ message: "Wallet created successfully", wallet });
  } catch (error) {
    console.error("❌ Create wallet error:", error);
    res.status(500).json({ message: "Server error while creating wallet" });
  }
});

// ✅ Update a wallet
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, address, caution } = req.body;
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    if (name) wallet.name = name;
    if (address) wallet.address = address;
    if (caution) wallet.caution = caution;

    await wallet.save();
    res.json({ message: "Wallet updated successfully", wallet });
  } catch (error) {
    console.error("❌ Update wallet error:", error);
    res.status(500).json({ message: "Server error while updating wallet" });
  }
});

// ✅ Delete a wallet
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    await wallet.remove();
    res.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("❌ Delete wallet error:", error);
    res.status(500).json({ message: "Server error while deleting wallet" });
  }
});

export default router;
