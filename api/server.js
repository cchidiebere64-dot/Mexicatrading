import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";        // ✅ Plans
import investmentRoutes from "./routes/investmentRoutes.js"; // ✅ Investments
import depositRoutes from "./routes/depositRoutes.js";  // ✅ Deposits (add this)

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// Test route
app.get("/", (req, res) => res.send("API Running 🚀"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/deposit", depositRoutes); // ✅ Deposit route added

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
