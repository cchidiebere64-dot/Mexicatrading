import { useState } from "react";

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const unlock = async () => {
    setLoading(true);

    try {
      const res = await fetch("https://mexicatradingbackend.onrender.com/api/auth/reauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onUnlock();
      } else {
        alert("Wrong password");
      }
    } catch (err) {
      alert("Error connecting to server");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-lg font-bold mb-3">Unlock App</h2>

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={unlock}
          disabled={loading}
          className="w-full bg-black text-white py-2"
        >
          {loading ? "Checking..." : "Unlock"}
        </button>
      </div>
    </div>
  );
}
