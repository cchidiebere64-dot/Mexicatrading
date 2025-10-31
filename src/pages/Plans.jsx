import { useState } from "react";

export default function Plans() {
  const API_URL = "https://mexicatradingbackend.onrender.com";

  const plans = [
    {
      name: "Starter",
      price: 50,
      profit: "5% weekly",
      features: ["Minimum Investment: $50", "Basic Support", "Instant Withdrawals"],
    },
    {
      name: "Pro",
      price: 200,
      profit: "8% weekly",
      features: ["Minimum Investment: $200", "Priority Support", "Advanced Analytics"],
    },
    {
      name: "Elite",
      price: 1000,
      profit: "12% weekly",
      features: ["Minimum Investment: $1000", "24/7 Dedicated Support", "VIP Dashboard"],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChoosePlan = async (plan) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/investments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ plan: plan.name, amount: plan.price }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Successfully invested in ${plan.name} plan!`);
        setSelectedPlan(plan.name);
      } else {
        setMessage(`❌ ${data.message || "Transaction failed"}`);

        if (data.message?.includes("Insufficient balance")) {
          alert("⚠️ Your balance is too low. Please deposit first.");
        }
      }

    } catch (error) {
      console.error("Investment error:", error);
      setMessage("❌ Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-2">💼 Investment Plans</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a plan that suits your goals 🚀
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-center font-semibold ${
            message.startsWith("✅")
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl shadow-md border hover:scale-105 transition-transform duration-300 cursor-pointer ${
              selectedPlan === plan.name
                ? "border-emerald-500 ring-2 ring-emerald-400"
                : "border-gray-200 dark:border-gray-700"
            } bg-white dark:bg-gray-800`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{plan.profit}</p>
            <p className="text-3xl font-bold text-emerald-500 mb-6">
              ${plan.price}
            </p>

            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <span className="text-emerald-400 mr-2">✔</span> {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleChoosePlan(plan)}
              disabled={loading}
              className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                selectedPlan === plan.name
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-emerald-500 hover:text-white"
              }`}
            >
              {loading
                ? "Processing..."
                : selectedPlan === plan.name
                ? "Selected ✅"
                : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

