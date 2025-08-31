import Plan from "../models/Plan.js";

// ✅ Create a plan (Admin only)
export const createPlan = async (req, res) => {
  try {
    const { name, minAmount, maxAmount, profitRate, duration, description } = req.body;

    const plan = await Plan.create({
      name,
      minAmount,
      maxAmount,
      profitRate,
      duration,
      description,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ Get all plans (Public)
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ Get single plan
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ msg: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ Update plan (Admin only)
export const updatePlan = async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPlan) return res.status(404).json({ msg: "Plan not found" });
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ Delete plan (Admin only)
export const deletePlan = async (req, res) => {
  try {
    const deleted = await Plan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Plan not found" });
    res.json({ msg: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
