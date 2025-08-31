export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold text-emerald-500">Mexicatrading 🚀</h2>
          <p className="mt-3 text-sm text-gray-400">
            Secure and smart investments to grow your wealth.  
            Trade confidently with Mexicatrading.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-emerald-400">Home</a></li>
            <li><a href="/plans" className="hover:text-emerald-400">Plans</a></li>
            <li><a href="/dashboard" className="hover:text-emerald-400">Dashboard</a></li>
            <li><a href="/login" className="hover:text-emerald-400">Login</a></li>
            <li><a href="/register" className="hover:text-emerald-400">Register</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Contact</h3>
          <p>Email: support@mexicatrading.com</p>
          <p className="mt-2">📍 Lagos, Nigeria</p>
          <p className="mt-2">© {new Date().getFullYear()} Mexicatrading. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


