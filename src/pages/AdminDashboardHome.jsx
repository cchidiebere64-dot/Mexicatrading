import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    deposits: 0,
    withdrawals: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>
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

      <div style={{ marginTop: "40px" }}>
        <h2>Recent Activities</h2>
        {stats.recentActivity.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>User</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Action</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Details</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.map((act) => (
                <tr key={act._id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {act.user ? act.user.name : "System"}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{act.action}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{act.details}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {new Date(act.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
