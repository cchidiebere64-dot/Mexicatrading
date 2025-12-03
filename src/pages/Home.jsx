import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">


      {/* HERO SECTION */}
<section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
  <h1 className="text-4xl md:text-6xl font-bold mb-6">
    Invest Smart with <span className="text-emerald-500">Mexicatrading 🚀</span>
  </h1>
  <p className="text-lg md:text-xl max-w-2xl mb-8">
    Your trusted platform for secure and profitable investments. 
    Grow your wealth with tailored plans that suit your lifestyle.
  </p>
  <div className="flex gap-4">
  <Link
    to="/register"
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
</div>

</section>

      

      {/* FEATURES SECTION */}
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

      {/* PLANS SECTION */}
      <section className="py-20 px-6 text-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-3xl font-bold mb-10">Our Investment Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Starter</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Begin with as low as $50.</p>
            <p className="font-bold text-emerald-500 text-lg mb-6">10% ROI / week</p>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
              Invest Now
            </Link>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">For consistent investors.</p>
            <p className="font-bold text-emerald-500 text-lg mb-6">15% ROI / week</p>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
              Invest Now
            </Link>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Premium</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Maximize your profits.</p>
            <p className="font-bold text-emerald-500 text-lg mb-6">20% ROI / week</p>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
              Invest Now
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-10">What Our Investors Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
            <p>"Mexicatrading has completely changed how I invest. I earn passive income weekly!"</p>
            <h4 className="mt-4 font-semibold">– John D.</h4>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl shadow">
            <p>"Safe, reliable, and profitable. I’ve grown my savings by 30% in just 3 months."</p>
            <h4 className="mt-4 font-semibold">– Sarah K.</h4>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 px-6 text-center bg-emerald-600 text-white">
        <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Wealth?</h2>
        <p className="mb-8">Join thousands of smart investors today and secure your financial future.</p>
        <Link
          to="/register"
          className="bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          Create Account
        </Link>
      </section>
    </div>
  );
}





