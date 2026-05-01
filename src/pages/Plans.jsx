import { useState } from "react";

export default function Plans() {
  const API_URL = "https://mexicatradingbackend.onrender.com";

  const plans = [
    {
      name: "Starter",
      price: 50,
      profit: "5% weekly",
      features: [
        "Minimum Investment: $50",
        "Basic Support",
        "Instant Withdrawals",
      ],
    },
    {
      name: "Pro",
      price: 200,
      profit: "8% weekly",
      features: [
        "Minimum Investment: $200",
        "Priority Support",
        "Advanced Analytics",
      ],
    },
    {
      name: "Elite",
      price: 1000,
      profit: "12% weekly",
      features: [
        "Minimum Investment: $1000",
        "24/7 Dedicated Support",
        "VIP Dashboard",
      ],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [processingPlan, setProcessingPlan] = useState(null);

  const handleChoosePlan = async (plan) => {
    setLoading(true);
    setProcessingPlan(plan.name);
    setMessage("");

    try {
      // simulate real system delay (makes it feel premium)
      await new Promise((r) => setTimeout(r, 1200));

      const profileRes = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const profileData = await profileRes.json();
      const balance = profileData.balance || 0;

      if (balance < plan.price) {
        setLoading(false);
        setProcessingPlan(null);
        setMessage("❌ Insufficient balance. Please deposit first.");
        return;
      }

      const res = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          plan: plan.name,
          amount: plan.price,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedPlan(plan.name);
        setMessage(`✅ Successfully invested in ${plan.name} plan!`);
      } else {
        setMessage(`❌ ${data.message || "Transaction failed"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again.");
    }

    setLoading(false);
    setProcessingPlan(null);
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-[#0a0f1c] text-white">

      {/* header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-2">
          💼 Investment Plans
        </h2>
        <p className="text-gray-400">
          Choose a plan that matches your financial goals
        </p>
      </div>

      {/* message */}
      {message && (
        <div className="mb-6 text-center">
          <span
            className={`px-4 py-2 rounded-lg ${
              message.startsWith("✅")
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {message}
          </span>
        </div>
      )}

      {/* cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:scale-[1.03] transition"
          >

            {/* glow */}
            <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl bg-emerald-500/10" />

            <h3 className="text-2xl font-bold mb-2">
              {plan.name}
            </h3>

            <p className="text-gray-400 mb-2">
              {plan.profit}
            </p>

            <p className="text-3xl font-bold text-emerald-400 mb-6">
              ${plan.price}
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-300">
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>

            <button
              onClick={() => handleChoosePlan(plan)}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition active:scale-95 ${
                selectedPlan === plan.name
                  ? "bg-emerald-500"
                  : "bg-white/10 hover:bg-emerald-500"
              }`}
            >
              {processingPlan === plan.name
                ? "Processing..."
                : selectedPlan === plan.name
                ? "Selected ✓"
                : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
