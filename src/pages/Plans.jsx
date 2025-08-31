export default function Plans() {
  const plans = [
    { name: "Starter", price: "$50", returnRate: "5% / week" },
    { name: "Pro", price: "$200", returnRate: "10% / week" },
    { name: "Elite", price: "$1000", returnRate: "20% / week" },
  ];

  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold mb-6">💼 Investment Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-gray-500">{plan.price}</p>
            <p className="text-emerald-500 font-bold">{plan.returnRate}</p>
            <button className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">
              Invest Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

