import React from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiPackage, FiDollarSign, FiArrowUpCircle } from "react-icons/fi";

export default function AdminDashboardHome() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-500 mb-2">Admin Dashboard Overview</h1>
        <p className="text-gray-400">Quick overview of platform stats and management options.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition">
          <div className="bg-emerald-500 text-white p-3 rounded-full">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-xl font-semibold">1,245</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition">
          <div className="bg-blue-500 text-white p-3 rounded-full">
            <FiPackage size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Plans</p>
            <p className="text-xl font-semibold">37</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition">
          <div className="bg-yellow-500 text-white p-3 rounded-full">
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Deposits</p>
            <p className="text-xl font-semibold">$42,000</p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4 hover:shadow-xl transition">
          <div className="bg-red-500 text-white p-3 rounded-full">
            <FiArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Withdrawals</p>
            <p className="text-xl font-semibold">$12,500</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-emerald-500 text-white p-4 rounded-lg text-center hover:bg-emerald-600 transition"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/plans"
            className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition"
          >
            Manage Plans
          </Link>
          <Link
            to="/admin/deposits"
            className="bg-yellow-500 text-white p-4 rounded-lg text-center hover:bg-yellow-600 transition"
          >
            View Deposits
          </Link>
          <Link
            to="/admin/withdrawals"
            className="bg-red-500 text-white p-4 rounded-lg text-center hover:bg-red-600 transition"
          >
            View Withdrawals
          </Link>
        </div>
      </div>
    </div>
  );
}
