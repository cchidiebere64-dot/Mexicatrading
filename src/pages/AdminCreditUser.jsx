import { useState } from "react";
import axios from "axios";

export default function AdminCreditUser() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCredit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Adjust this URL to match your backend endpoint
      const res = await axios.post("/api/admin/credit-user", {
        email,
        amount: parseFloat(amount),
      });

      setMessage(res.data?.message || "User credited successfully!");
      setEmail("");
      setAmount("");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error || "Failed to credit user. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Credit User Account</h1>

      <form
        onSubmit={handleCredit}
        className="max-w-md bg-white shadow p-6 rounded-lg space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount to Credit
          </label>
          <input
            type="number"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
        >
          {loading ? "Processing..." : "Credit User"}
        </button>

        {message && (
          <p
            className={`text-center mt-3 ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
