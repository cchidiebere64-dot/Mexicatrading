import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    deposits: 0,
    withdrawals: 0,
    recentActivity: [],
    allUsers: [],
    allDeposits: [],
    allWithdrawals: [],
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const depositsData = await axios.get("/api/admin/deposits", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usersData = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const withdrawalsData = await axios.get("/api/admin/withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        ...stats,
        users: data.totalUsers,
        plans: data.totalPlans,
        deposits: data.totalDeposits,
        withdrawals: data.totalWithdrawals,
        recentActivity: data.recentActivity,
        allUsers: usersData.data,
        allDeposits: depositsData.data,
        allWithdrawals: withdrawalsData.data,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading Admin Dashboard...</div>;

  // Handler examples
  const handleApproveDeposit = async (id) => {
    await axios.put(
      `/api/admin/deposits/${id}`,
      { action: "approve" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDashboardData();
  };

  const handleRejectDeposit = async (id) => {
    await axios.put(
      `/api/admin/deposits/${id}`,
      { action: "reject" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDashboardData();
  };

  const handleFreezeUser = async (id) => {
    await axios.put(
      `/api/admin/users/${id}/freeze`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDashboardData();
  };

  const handleDeleteUser = async (id) => {
    await axios.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDashboardData();
  };

  const handleUpdateBalance = async (id, type, amount) => {
    await axios.put(
      `/api/admin/users/${id}/balance`,
      { type, amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDashboardData();
  };

  const handleResetPassword = async (id, newPassword) => {
    await axios.put(
      `/api/admin/users/${id}/reset-password`,
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchDashboardData();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <h3>Total Users</h3>
          <p>{stats.users}</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <h3>Total Plans</h3>
          <p>{stats.plans}</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <h3>Total Deposits</h3>
          <p>${stats.deposits}</p>
        </div>
        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <h3>Total Withdrawals</h3>
          <p>${stats.withdrawals}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: "40px" }}>
        <h2>Recent Activities</h2>
        {stats.recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((act) => (
                <tr key={act._id}>
                  <td>{act.user ? act.user.name : "System"}</td>
                  <td>{act.action}</td>
                  <td>{act.details}</td>
                  <td>{new Date(act.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Users Table */}
      <div style={{ marginTop: "40px" }}>
        <h2>All Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.allUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>${user.balance}</td>
                <td>
                  <button onClick={() => handleFreezeUser(user._id)}>
                    {user.freezeWithdrawals ? "Unfreeze" : "Freeze"}
                  </button>{" "}
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deposits Table */}
      <div style={{ marginTop: "40px" }}>
        <h2>All Deposits</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.allDeposits.map((d) => (
              <tr key={d._id}>
                <td>{d.user.name}</td>
                <td>${d.amount}</td>
                <td>{d.status}</td>
                <td>
                  {d.status === "pending" && (
                    <>
                      <button onClick={() => handleApproveDeposit(d._id)}>Approve</button>{" "}
                      <button onClick={() => handleRejectDeposit(d._id)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Withdrawals Table */}
      <div style={{ marginTop: "40px" }}>
        <h2>All Withdrawals</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.allWithdrawals.map((w) => (
              <tr key={w._id}>
                <td>{w.user.name}</td>
                <td>${w.amount}</td>
                <td>{w.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
