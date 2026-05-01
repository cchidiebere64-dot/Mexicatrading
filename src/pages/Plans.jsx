import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Plans() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();

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

  // NEW MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [balanceCheck, setBalanceCheck] = useState(null);

  const openModal = (plan) => {
    setActivePlan(plan);
    setModalOpen(true);
    setMessage("");
    setBalanceCheck(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePlan(null);
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const profileRes = await fetch(`${API_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const profileData = await profileRes.json();
      const balance = profileData.balance || 0;

      if (balance < activePlan.price) {
        setBalanceCheck("insufficient");
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
          plan: activePlan.name,
          amount: activePlan.price,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBalanceCheck("success");
        setMessage("✅ Investment confirmed successfully!");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

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

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full top-[-200px] left-[-200px]" />
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full bottom-[-200px] right-[-200px]" />
      </div>

      {/* HEADER */}
      <div className="text-center mb-14 relative">
        <h2 className="text-4xl font-bold">
          Investment <span className="text-emerald-400">Plans</span>
        </h2>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="text-center mb-6 text-emerald-300">
          {message}
        </div>
      )}

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">

        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl hover:scale-[1.03] transition"
          >
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-gray-400">{plan.profit}</p>

            <div className="text-3xl text-emerald-400 my-4">
              ${plan.price}
            </div>

            <ul className="text-gray-300 mb-6 space-y-1">
              {plan.features.map((f, i) => (
                <li key={i}>✔ {f}</li>
              ))}
            </ul>

            <button
              onClick={() => openModal(plan)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl"
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && activePlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">

          <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl w-full max-w-md">

            <h2 className="text-xl font-bold mb-2">
              Confirm Investment
            </h2>

            <p className="text-gray-400 mb-4">
              You are about to subscribe to:
            </p>

            <div className="bg-white/5 p-4 rounded-xl mb-4">
              <p><b>Plan:</b> {activePlan.name}</p>
              <p><b>Price:</b> ${activePlan.price}</p>
              <p><b>Profit:</b> {activePlan.profit}</p>
            </div>

            {/* STATUS */}
            {balanceCheck === "insufficient" && (
              <div className="text-red-400 mb-3">
                Insufficient balance.
              </div>
            )}

            {balanceCheck === "success" && (
              <div className="text-emerald-400 mb-3">
                Success! Redirecting...
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex gap-3">

              <button
                onClick={closeModal}
                className="flex-1 py-2 bg-gray-600 rounded-lg"
              >
                Cancel
              </button>

              {balanceCheck === "insufficient" ? (
                <button
                  onClick={() => navigate("/deposit")}
                  className="flex-1 py-2 bg-emerald-500 rounded-lg"
                >
                  Deposit
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-500 rounded-lg"
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
