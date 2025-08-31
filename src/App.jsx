import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <h1 className="text-5xl font-bold text-emerald-400">
        🚀 Tailwind v3 is working!
      </h1>
    </div>
  );
}



