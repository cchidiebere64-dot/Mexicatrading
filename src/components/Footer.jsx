export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-emerald-600 mb-4">Mexicatrading 🚀</h2>
          <p className="text-sm">
            Smart investment platform where your money works for you.
            Secure • Reliable • Profitable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-emerald-500">Home</a></li>
            <li><a href="/plans" className="hover:text-emerald-500">Plans</a></li>
            <li><a href="/dashboard" className="hover:text-emerald-500">Dashboard</a></li>
            <li><a href="/login" className="hover:text-emerald-500">Login</a></li>
            <li><a href="/register" className="hover:text-emerald-500">Register</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
          <p>Email: <a href="mailto:support@mexicatrading.com" className="hover:text-emerald-500">support@mexicatrading.com</a></p>
          <p>Phone: <a href="tel:+123456789" className="hover:text-emerald-500">+123 456 789</a></p>
          <p>Location: Lagos, Nigeria</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t dark:border-gray-700 py-4 text-center text-sm">
        © {new Date().getFullYear()} Mexicatrading. All Rights Reserved.
      </div>
    </footer>
  );
}
