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

  const handleChoosePlan = async (plan) => {
    setLoading(true);
    setMessage("");

    try {
      const profileRes = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const profileData = await profileRes.json();
      const balance = profileData.balance || 0;

      if (balance < plan.price) {
        setMessage("❌ Insufficient balance. Please deposit first.");
        alert("⚠️ You do not have enough balance to invest in this plan.");
        setLoading(false);
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
  };

  return (
    <div className="relative min-h-screen px-6 py-16 bg-[#0a0f1c] text-white overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
      </div>

      {/* header */}
      <div className="text-center mb-14 relative">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Investment <span className="text-emerald-400">Plans</span>
        </h2>
        <p className="text-gray-400 mt-3">
          Choose a plan that fits your financial growth strategy
        </p>
      </div>

      {/* message */}
      {message && (
        <div
          className={`max-w-2xl mx-auto mb-10 p-4 rounded-xl text-center font-semibold backdrop-blur-md border ${
            message.startsWith("✅")
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">

        {plans.map((plan, idx) => {
          const isSelected = selectedPlan === plan.name;

          return (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
                isSelected
                  ? "border-emerald-400 shadow-emerald-500/20 shadow-2xl"
                  : "border-white/10 shadow-black/40 shadow-xl"
              } bg-white/5`}
            >

              {/* glow accent */}
              <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition bg-gradient-to-br from-emerald-500/10 to-blue-500/10 pointer-events-none" />

              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-gray-400 mb-3">{plan.profit}</p>

              <div className="text-4xl font-extrabold text-emerald-400 mb-6">
                ${plan.price}
              </div>

              <ul className="space-y-2 mb-6 text-gray-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400">✔</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleChoosePlan(plan)}
                disabled={loading && isSelected}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-white/10 hover:bg-emerald-500 hover:text-white border border-white/10"
                }`}
              >
                {loading && isSelected
                  ? "Processing..."
                  : isSelected
                  ? "Active Plan ✓"
                  : "Choose Plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
