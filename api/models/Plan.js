import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    profitRate: { type: Number, required: true }, // % return
    duration: { type: Number, required: true }, // in days
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);
