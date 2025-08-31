
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: String,
  invested: Number,
  profit: Number,
});

const historySchema = new mongoose.Schema({
  action: String,
  amount: String,
  date: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  balance: { type: Number, default: 0 },
  plans: [planSchema],
  history: [historySchema],
});

export default mongoose.model("User", userSchema);
