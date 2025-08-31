import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-emerald-400">Mexicatrading 🚀</h1>
      <div className="flex gap-6">
        <Link to="/" className="hover:text-emerald-400">Home</Link>
        <Link to="/plans" className="hover:text-emerald-400">Plans</Link>
      </div>
    </nav>
  );
}


