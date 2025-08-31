import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
      <h2 className="text-lg font-bold">Mexicatrading 🚀</h2>
      <div className="flex gap-6">
        <Link to="/" className="hover:text-emerald-400">Home</Link>
        <Link to="/plans" className="hover:text-emerald-400">Plans</Link>
        <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
      </div>

      <div className="flex gap-6">
  <Link to="/" className="hover:text-emerald-400">Home</Link>
  <Link to="/plans" className="hover:text-emerald-400">Plans</Link>
  <Link to="/dashboard" className="hover:text-emerald-400">Dashboard</Link>
</div>

    </nav>

    
  );
}

export default Navbar;

