export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-500">
          Welcome to Mexicatrading 🚀
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl text-gray-600 dark:text-gray-300">
          Invest smartly, grow your wealth, and manage your trading plans all in one place.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/register"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border border-emerald-600 text-emerald-600 dark:text-emerald-400 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-600 hover:text-white transition"
          >
            Login
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">📈 Smart Investments</h3>
            <p>Choose from multiple plans that suit your trading goals and risk profile.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">💳 Secure Wallet</h3>
            <p>Track your deposits, withdrawals, and balances with full transparency.</p>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-3">🚀 Easy Dashboard</h3>
            <p>Monitor all your investments and profits in real time with our dashboard.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to start your trading journey?
        </h2>
        <a
          href="/register"
          className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition"
        >
          Join Now
        </a>
      </section>
    </div>
  );
}
