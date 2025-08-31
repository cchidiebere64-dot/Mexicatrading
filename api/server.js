import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// connect database
connectDB();

app.get("/", (req, res) => res.send("🚀 API Running..."));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
