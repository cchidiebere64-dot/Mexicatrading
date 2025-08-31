import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";   // ✅ add plans
import investmentRoutes from "./routes/investmentRoutes.js"; // ✅ add investments (later)

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// Test route
app.get("/", (req, res) => res.send("API Running 🚀"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);         // ✅ plans API
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/investments", investmentRoutes); // ✅ investments API

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


