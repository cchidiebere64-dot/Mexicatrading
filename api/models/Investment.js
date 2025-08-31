import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true },
    profit: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", investmentSchema);
export default Investment;

