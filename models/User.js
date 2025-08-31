
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  action: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  plans: [
    {
      name: String,
      invested: Number,
      profit: Number,
    },
  ],
  history: [historySchema],
  role: { type: String, default: "user" }, // can be "admin"
});

const User = mongoose.model("User", userSchema);

export default User;

