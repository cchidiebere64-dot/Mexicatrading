import { Link } from "react-router-dom";
import mexicanLogo from "../assets/mexican.png"; // 👈 make sure this path is correct

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/90 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        
        {/* LOGO + NAME */}
        <div className="flex items-center gap-2">
          <img
            src={mexicanLogo}
            alt="MexicaTrading Logo"
            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_#10B981]"
          />
          <span className="text-emerald-400 text-lg font-bold tracking-wide">
            Mexica<span className="text-white">Trading</span>
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex gap-8 text-gray-300 font-medium">
          <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
          <Link to="/plans" className="hover:text-emerald-400 transition">Plans</Link>
          <Link to="/deposit" className="hover:text-emerald-400 transition">Deposit</Link>
          <Link to="/withdraw" className="hover:text-emerald-400 transition">Withdraw</Link>
          <Link to="/login" className="hover:text-emerald-400 transition">Login</Link>
        </nav>

        {/* MOBILE MENU PLACEHOLDER (optional future use) */}
        <button className="md:hidden text-emerald-400 text-2xl">
          ☰
        </button>
      </div>
    </header>
  );
}





// src/components/Navbar.jsx
{/*import { Link } from "react-router-dom";
import mexicanLogo from "../assets/mexican.png"; // make sure path is correct

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900/90 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        
        {/* LOGO + NAME */}
{/* <div className="flex items-center gap-2">
          <img
            src={mexicanLogo}
            alt="MexicaTrading Logo"
            className="h-10 w-10 object-contain drop-shadow-[0_0_10px_#10B981]"
          />
          <span className="text-emerald-400 text-lg font-bold tracking-wide">
            Mexica<span className="text-white">Trading</span>
          </span>
        </div>

        {/* NAVIGATION LINKS */}
{/*  <nav className="hidden md:flex gap-8 text-gray-300 font-medium">
          {/* Always show Home link */}
{/*  <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
          
          {/* Keep all other links exactly as they were before */}
          {/* <Link to="/plans" className="hover:text-emerald-400 transition">Plans</Link>
          <Link to="/deposit" className="hover:text-emerald-400 transition">Deposit</Link>
          <Link to="/withdraw" className="hover:text-emerald-400 transition">Withdraw</Link>
          <Link to="/login" className="hover:text-emerald-400 transition">Login</Link>
        </nav>

        {/* MOBILE MENU */}
          {/* <button className="md:hidden text-emerald-400 text-2xl">☰</button>
      </div>
    </header>
  );
}*/}

