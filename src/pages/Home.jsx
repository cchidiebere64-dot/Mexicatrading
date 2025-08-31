export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 
      bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white 
      dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 dark:text-gray-900">

      <h2 className="text-4xl font-bold mb-4">Welcome to Mexicatrading 🚀</h2>
      <p className="text-lg max-w-2xl mb-6">
        Invest smart, earn fast. Choose from our tailored investment plans and grow your wealth securely with Mexicatrading.
      </p>
      <a
        href="/plans"
        className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition"
      >
        View Plans
      </a>
    </div>
  );
}
