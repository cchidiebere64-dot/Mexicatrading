import React from "react";


function Dashboard() {
  return (
    <div className="p-8 bg-slate-50 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
        Your Dashboard
      </h1>
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <p className="text-slate-600 mb-4">
          Track your investments and returns here.
        </p>

        {/* Example placeholder data */}
        <div className="border-t border-slate-200 pt-4">
          <h2 className="text-xl font-semibold text-slate-700">Active Investments</h2>
          <ul className="mt-3 space-y-2 text-left">
            <li className="p-3 bg-slate-100 rounded-lg">Starter Plan — $500 invested — ROI: $25</li>
            <li className="p-3 bg-slate-100 rounded-lg">Growth Plan — $2000 invested — ROI: $160</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


