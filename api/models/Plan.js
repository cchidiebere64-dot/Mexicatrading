import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },  // e.g. "Bronze Plan"
    minDeposit: { type: Number, required: true },
    maxDeposit: { type: Number, required: true },
    profitPercent: { type: Number, required: true }, // e.g. 20% ROI
    durationDays: { type: Number, required: true },  // how long plan runs
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;

