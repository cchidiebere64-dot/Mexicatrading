import { useEffect, useState } from "react";

export default function Plans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const res = await fetch("http://localhost:5000/api/plans");
      const data = await res.json();
      setPlans(data);
    };
    fetchPlans();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">💼 Investment Plans</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p>{plan.description}</p>
            <p>
              Min: ${plan.minAmount} – Max: ${plan.maxAmount}
            </p>
            <p>Profit Rate: {plan.profitRate}% in {plan.duration} days</p>
            <button
              onClick={() => alert(`Invest in ${plan.name}`)}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded"
            >
              Invest
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

