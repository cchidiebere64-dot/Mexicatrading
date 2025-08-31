import { useNavigate } from "react-router-dom";

export default function Plans() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleInvest = async (plan, amount) => {
    try {
      const res = await fetch("http://localhost:5000/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ plan, amount }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Invested in ${plan} plan successfully!`);
        navigate("/dashboard");
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Investment failed");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">💼 Investment Plans</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Starter Plan</h3>
          <p>$50 Minimum</p>
          <button
            onClick={() => handleInvest("Starter", 50)}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Invest $50
          </button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-2">Pro Plan</h3>
          <p>$200 Minimum</p>
          <button
            onClick={() => handleInvest("Pro", 200)}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Invest $200
          </button>
        </div>
      </div>
    </div>
  );
}
