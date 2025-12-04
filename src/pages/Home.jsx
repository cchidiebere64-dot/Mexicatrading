import { Link } from "react-router-dom";

export default function Home() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/MexicatradingSetup.exe"; // Make sure this file is in public/
    link.download = "MexicatradingSetup.exe";
    link.click();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Invest Smart with <span className="text-emerald-500">Mexicatrading 🚀</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mb-8">
          Your trusted platform for secure and profitable investments. Grow your wealth with tailored plans.
        </p>
        <div className="flex gap-4">
          <Link
            to="/register" // ✅ Changed to registration
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Login
          </Link>
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Download
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">🔒 Secure</h3>
            <p>Your funds are protected with bank-level security and encryption.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">⚡ Profitable</h3>
            <p>Earn consistent returns based on your chosen investment plan.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">🌍 Accessible</h3>
            <p>Invest from anywhere in the world with a simple and easy-to-use platform.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-6 text-center bg-emerald-600 text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Wealth?</h2>
        <p className="mb-8">Join thousands of smart investors today and secure your financial future.</p>
        <Link
          to="/register" // ✅ Changed to registration
          className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          Get Started
        </Link>
      </section>
    </div>
  );
}
