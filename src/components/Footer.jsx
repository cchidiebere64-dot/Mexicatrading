import { Facebook, Twitter, Linkedin, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold text-emerald-500 mb-4">Mexicatrading 🚀</h2>
          <p className="text-gray-400 text-sm">
            Your trusted partner in smart investments. Grow your wealth with our
            secure and transparent investment plans.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400">Home</Link></li>
            <li><Link to="/plans" className="hover:text-emerald-400">Investment Plans</Link></li>
            <li><Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-emerald-400">Register</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-emerald-400">Help Center</a></li>
            <li><a href="#" className="hover:text-emerald-400">FAQs</a></li>
            <li><a href="#" className="hover:text-emerald-400">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
          <p className="text-sm mb-2">📍 Lagos, Nigeria</p>
          <p className="text-sm mb-4 flex items-center gap-2">
            <Mail size={16} /> support@mexicatrading.com
          </p>

          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-400"><Facebook size={20} /></a>
            <a href="#" className="hover:text-emerald-400"><Twitter size={20} /></a>
            <a href="#" className="hover:text-emerald-400"><Linkedin size={20} /></a>
            <a href="#" className="hover:text-emerald-400"><Instagram size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Mexicatrading. All rights reserved.
      </div>
    </footer>
  );
}
