import { useState } from "react";

function Plans() {
  const [plans] = useState([
    { id: 1, name: "Starter Plan", rate: "5% monthly", min: 100, max: 999 },
    { id: 2, name: "Growth Plan", rate: "8% monthly", min: 1000, max: 4999 },
    { id: 3, name: "Pro Plan", rate: "12% monthly", min: 5000, max: 20000 },
  ]);

  return (
    <div className="p-8 text-center bg-slate-50 min-h-[80vh]">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Our Investment Plans
      </h1>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl shadow-lg p-6 text-slate-800 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-emerald-600 font-bold">{plan.rate}</p>
            <p className="text-sm text-slate-500">
              Invest: ${plan.min} - ${plan.max}
            </p>
            <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plans;
